import { ApiProblem, type ProblemDetails } from './problem';

let csrfToken: string | undefined;

async function loadCsrf(): Promise<string> {
  if (csrfToken) return csrfToken;
  const response = await fetch('/api/v1/session/csrf', { credentials: 'same-origin' });
  if (!response.ok) throw await toProblem(response);
  const payload = (await response.json()) as { token: string };
  csrfToken = payload.token;
  return payload.token;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json, application/problem+json');
  headers.set('X-Correlation-ID', crypto.randomUUID());
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-XSRF-TOKEN', await loadCsrf());

  let response: Response;
  try {
    response = await fetch(path, { ...init, method, headers, credentials: 'same-origin' });
  } catch {
    throw new ApiProblem({
      type: 'urn:sorveteria:problem:network-unavailable',
      title: 'Servidor indisponível',
      status: 503,
      detail: 'Consulte o estado antes de repetir uma alteração.',
      code: 'NETWORK_UNAVAILABLE',
      correlationId: headers.get('X-Correlation-ID') ?? crypto.randomUUID()
    });
  }
  if (response.status === 204) return undefined as T;
  if (!response.ok) {
    if (response.status === 403) csrfToken = undefined;
    throw await toProblem(response);
  }
  return response.json() as Promise<T>;
}

export function clearApiSecurityState() { csrfToken = undefined; }

async function toProblem(response: Response): Promise<ApiProblem> {
  const fallback: ProblemDetails = {
    type: 'about:blank',
    title: 'Falha na operação',
    status: response.status,
    code: 'HTTP_ERROR',
    correlationId: response.headers.get('X-Correlation-ID') ?? crypto.randomUUID()
  };
  let problem = fallback;
  try { problem = (await response.json()) as ProblemDetails; } catch { /* corpo não estruturado */ }
  const retry = response.headers.get('Retry-After');
  return new ApiProblem(problem, retry ? Number(retry) : undefined);
}


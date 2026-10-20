import { apiRequest } from '@/shared/api/apiClient';
import type { SessionView } from '@/shared/api/generated';

export function getSession() { return apiRequest<SessionView>('/api/v1/session'); }
export function login(loginName: string, password: string) {
  return apiRequest<SessionView>('/api/v1/session', {
    method: 'POST', body: JSON.stringify({ login: loginName, password })
  });
}
export function logout(): Promise<void> {
  return apiRequest<undefined>('/api/v1/session', { method: 'DELETE' }).then(() => undefined);
}
export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest<SessionView>('/api/v1/session/password', {
    method: 'PUT', body: JSON.stringify({ currentPassword, newPassword })
  });
}


export interface Violation {
  field: string;
  code: string;
  message: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code: string;
  correlationId: string;
  violations?: Violation[];
}

export class ApiProblem extends Error {
  constructor(public readonly problem: ProblemDetails, public readonly retryAfter?: number) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiProblem';
  }
}


// Tipos estáveis derivados do contrato OpenAPI. Não editar sem validar o contrato.
export type RoleCode = 'ADMINISTRATOR' | 'OPERATOR';
export type AuditOutcome = 'SUCCEEDED' | 'DENIED' | 'FAILED';

export interface AuditEvent {
  id: string;
  occurredAt: string;
  action: string;
  outcome: AuditOutcome;
  origin: string;
  actorUserId: string | null;
  actorLogin: string | null;
  actorName: string | null;
  targetType: string | null;
  targetId: string | null;
  reason: string | null;
  correlationId: string;
  changes: { before: Record<string, unknown>; after: Record<string, unknown> };
}

export interface AuditPage {
  items: AuditEvent[];
  nextCursor: string | null;
}

export interface User {
  id: string;
  login: string;
  displayName: string;
  active: boolean;
  mustChangePassword: boolean;
  temporaryPasswordExpiresAt: string | null;
  roles: RoleCode[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  code: RoleCode;
  displayName: string;
}

export interface SessionView {
  user: User;
  permissions: string[];
  authenticatedAt: string;
  idleExpiresAt: string;
  absoluteExpiresAt: string;
}

export interface Address {
  postalCode?: string;
  street?: string;
  number?: string;
  complement?: string | null;
  district?: string;
  city?: string;
  stateCode?: string;
  countryCode?: 'BR';
}

export interface Store {
  id: '1';
  tradeName: string;
  legalName?: string | null;
  taxId?: string | null;
  address?: Address | null;
  currencyCode: 'BRL';
  timeZone: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}


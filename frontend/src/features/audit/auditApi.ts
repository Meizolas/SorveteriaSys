import { apiRequest } from '@/shared/api/apiClient';
import type { AuditOutcome, AuditPage } from '@/shared/api/generated';

export type AuditFilters = {
  occurredFrom: string;
  occurredTo: string;
  actorUserId?: string;
  action?: string;
  outcome?: AuditOutcome;
  cursor?: string;
  limit?: number;
};

export function listAuditEvents(filters: AuditFilters) {
  const query = new URLSearchParams({ occurredFrom: filters.occurredFrom,
    occurredTo: filters.occurredTo, limit: String(filters.limit ?? 30) });
  if (filters.actorUserId) query.set('actorUserId', filters.actorUserId);
  if (filters.action) query.set('action', filters.action);
  if (filters.outcome) query.set('outcome', filters.outcome);
  if (filters.cursor) query.set('cursor', filters.cursor);
  return apiRequest<AuditPage>(`/api/v1/audit-events?${query.toString()}`);
}

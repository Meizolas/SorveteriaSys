import { apiRequest } from '@/shared/api/apiClient';
import type { Role, RoleCode, User } from '@/shared/api/generated';

export type CreateUserInput = {
  login: string;
  displayName: string;
  temporaryPassword: string;
  roles: RoleCode[];
};

export type UpdateUserInput = {
  login: string;
  displayName: string;
  active: boolean;
  roles: RoleCode[];
  version: number;
};

export const listUsers = () => apiRequest<User[]>('/api/v1/users');
export const listRoles = () => apiRequest<Role[]>('/api/v1/roles');
export const createUser = (input: CreateUserInput) => apiRequest<User>('/api/v1/users', {
  method: 'POST', body: JSON.stringify(input)
});
export const updateUser = (id: string, input: UpdateUserInput) => apiRequest<User>(`/api/v1/users/${id}`, {
  method: 'PATCH', body: JSON.stringify(input)
});
export const resetTemporaryPassword = (id: string, temporaryPassword: string) =>
  apiRequest<User>(`/api/v1/users/${id}/temporary-password`, {
    method: 'POST', body: JSON.stringify({ temporaryPassword })
  });

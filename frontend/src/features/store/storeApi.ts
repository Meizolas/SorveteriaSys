import { apiRequest } from '@/shared/api/apiClient';
import type { Address, Store } from '@/shared/api/generated';

export type StoreInput = {
  tradeName: string;
  legalName: string | null;
  taxId: string | null;
  address: Address | null;
  currencyCode: 'BRL';
  timeZone: string;
};

export const getStore = () => apiRequest<Store>('/api/v1/store');
export const saveStore = (input: StoreInput, version: number | null) => apiRequest<Store>('/api/v1/store', {
  method: 'PUT', ...(version === null ? {} : { headers: { 'If-Match': `"${version}"` } }),
  body: JSON.stringify(input)
});

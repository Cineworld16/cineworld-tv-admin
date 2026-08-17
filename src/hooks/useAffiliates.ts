import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { AffiliateDetail, AffiliatesResponse } from '@/types/affiliate';

export interface AffiliatesRange {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

export function useAffiliates(range?: AffiliatesRange) {
  const from = range?.from ?? '';
  const to = range?.to ?? '';
  return useQuery<AffiliatesResponse>({
    queryKey: ['affiliates', from, to],
    queryFn: () =>
      apiRequest<AffiliatesResponse>('/api/admin/affiliates', {
        query: { from: from || undefined, to: to || undefined },
      }),
    staleTime: 30_000,
  });
}

export function useAffiliateDetail(key: string | null) {
  return useQuery<AffiliateDetail>({
    queryKey: ['affiliate-detail', key],
    queryFn: () =>
      apiRequest<AffiliateDetail>(`/api/admin/affiliates/${encodeURIComponent(key as string)}`),
    enabled: !!key,
    staleTime: 30_000,
  });
}

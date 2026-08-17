import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Subscriber, SubscribersListResponse, SubscriberStatus } from '@/types/subscriber';

export interface UseSubscribersParams {
  search?: string;
  status?: SubscriberStatus | 'todos' | 'agendado';
  page: number;
  pageSize: number;
}

export function useSubscribers(params: UseSubscribersParams) {
  return useQuery<SubscribersListResponse>({
    queryKey: ['subscribers', params],
    queryFn: () =>
      apiRequest<SubscribersListResponse>('/api/admin/subscribers', {
        query: {
          search: params.search,
          status: params.status && params.status !== 'todos' ? params.status : undefined,
          page: params.page,
          pageSize: params.pageSize,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useCredentials(id: string, enabled: boolean) {
  return useQuery<{ usuario: string; senha: string }>({
    queryKey: ['credentials', id],
    queryFn: () => apiRequest(`/api/admin/subscribers/${id}/credentials`),
    enabled,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useSaveCredentials(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { usuario: string; senha: string }) =>
      apiRequest<Subscriber>(`/api/admin/subscribers/${id}/credentials`, {
        method: 'PATCH',
        body: input,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscribers'] });
      qc.invalidateQueries({ queryKey: ['credentials', id] });
    },
  });
}

export function useSendEmail(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { force?: boolean } = {}) =>
      apiRequest<Subscriber>(`/api/admin/subscribers/${id}/send-email`, {
        method: 'POST',
        query: opts.force ? { force: 'true' } : {},
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}

export function useProvision(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<Subscriber>(`/api/admin/subscribers/${id}/provision`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}

export function useToggleRevoke(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (revoked: boolean) =>
      apiRequest<Subscriber>(`/api/admin/subscribers/${id}/revoke`, {
        method: 'PATCH',
        body: { revoked },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SubscribersTable } from '@/components/subscribers/SubscribersTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscribers } from '@/hooks/useSubscribers';
import type { SubscriberStatus } from '@/types/subscriber';

const PAGE_SIZE = 50;

type TabValue = 'todos' | 'agendado' | SubscriberStatus;

const TABS: { value: TabValue; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'agendado', label: 'Agendados' },
  { value: 'credenciais_preenchidas', label: 'Aguardando envio' },
  { value: 'email_enviado', label: 'Enviados' },
  { value: 'reembolsado', label: 'Estornados' },
  { value: 'cancelado', label: 'Cancelados' },
];

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabValue>('todos');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: tab,
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, tab, page],
  );

  const q = useSubscribers(params);
  const total = q.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Assinantes</h1>
        <p className="text-sm text-muted-foreground">
          Compras da Kirvano, dados prontos pra levar ao Havok e enviar o acesso.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as TabValue);
            setPage(1);
          }}
        >
          <TabsList className="flex flex-wrap">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou email"
            className="pl-8"
          />
        </div>
      </div>

      {q.isLoading ? (
        <div className="rounded-md border border-border/60 p-8 text-center text-muted-foreground">
          Carregando…
        </div>
      ) : q.isError ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          Erro ao buscar assinantes: {(q.error as Error).message}
        </div>
      ) : (
        <>
          <SubscribersTable data={q.data?.data ?? []} />
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {total} assinante{total === 1 ? '' : 's'} · página {page} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

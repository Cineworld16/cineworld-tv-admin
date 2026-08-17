import { Award, ChevronRight, DollarSign, Receipt } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RevenueChart } from '@/components/RevenueChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAffiliateDetail, useAffiliates } from '@/hooks/useAffiliates';
import { formatBRL, formatDate } from '@/lib/formatters';
import type { Affiliate } from '@/types/affiliate';

function prettyMethod(m: string): string {
  const map: Record<string, string> = {
    PIX: 'PIX',
    CREDIT_CARD: 'Cartão de crédito',
    DEBIT_CARD: 'Cartão de débito',
    BANK_SLIP: 'Boleto',
    BOLETO: 'Boleto',
    APPLE_PAY: 'Apple Pay',
    GOOGLE_PAY: 'Google Pay',
  };
  return map[m] ?? m;
}

function pct(rate: number | null): string {
  return rate == null ? '—' : `${Math.round(rate * 100)}%`;
}

function statusBadge(status: string) {
  if (status === 'cancelado' || status === 'reembolsado')
    return <Badge variant="destructive">{status}</Badge>;
  if (status === 'email_enviado') return <Badge>enviado</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function AffiliateDetailDialog({ affKey, onClose }: { affKey: string | null; onClose: () => void }) {
  const q = useAffiliateDetail(affKey);
  const d = q.data;
  const desc =
    d?.tipo === 'voce'
      ? 'Suas vendas diretas (sem afiliado) e sua comissão.'
      : d?.tipo === 'socio'
        ? 'Vendas do Erik e a comissão dele.'
        : 'Vendas que esse afiliado referiu.';

  return (
    <Dialog open={!!affKey} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="break-all">{d?.label ?? affKey}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        {q.isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Carregando…</div>
        ) : q.isError ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            Erro: {(q.error as Error).message}
          </div>
        ) : d ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <StatTile label="Vendas válidas" value={String(d.totals.validas)} hint={`${d.totals.vendas} no total`} />
              <StatTile label="Receita" value={formatBRL(d.totals.receita)} />
              <StatTile label="Ticket médio" value={formatBRL(d.totals.ticketMedio)} />
              <StatTile label="Comissão" value={formatBRL(d.totals.comissao)} />
              <StatTile
                label="Conversão"
                value={pct(d.conversion.rate)}
                hint={`${d.conversion.approved} de ${d.conversion.attempts} checkouts`}
              />
            </div>

            {d.paymentMethods.length > 0 && (
              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  Forma de pagamento
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.paymentMethods.map((p) => (
                    <Badge key={p.method} variant="outline">
                      {prettyMethod(p.method.toUpperCase())} · {p.count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Vendas ({d.sales.length})
              </div>
              <div className="rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Pgto</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.sales.map((s) => (
                      <TableRow key={s.sale_id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(s.data_compra)}
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate">{s.nome || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{s.plano}</TableCell>
                        <TableCell className="text-right">{formatBRL(s.valor_total)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.payment_method ? prettyMethod(s.payment_method.toUpperCase()) : '—'}
                        </TableCell>
                        <TableCell>{statusBadge(s.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold tracking-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

type Preset = '7' | '30' | '90' | 'all' | 'custom';

const PRESETS: { p: Preset; lbl: string }[] = [
  { p: '7', lbl: '7 dias' },
  { p: '30', lbl: '30 dias' },
  { p: '90', lbl: '90 dias' },
  { p: 'all', lbl: 'Tudo' },
];

function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function presetRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: isoDay(from), to: isoDay(to) };
}

function FilterBar({
  preset,
  from,
  to,
  onPreset,
  onFrom,
  onTo,
}: {
  preset: Preset;
  from: string;
  to: string;
  onPreset: (p: Preset) => void;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  const dateCls =
    'h-8 rounded-md border border-border/60 bg-background px-2 text-sm text-foreground [color-scheme:dark]';
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1">
        {PRESETS.map(({ p, lbl }) => (
          <Button
            key={p}
            variant={preset === p ? 'default' : 'ghost'}
            size="sm"
            className="h-8"
            onClick={() => onPreset(p)}
          >
            {lbl}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>De</span>
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onFrom(e.target.value)}
          className={dateCls}
        />
        <span>até</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onTo(e.target.value)}
          className={dateCls}
        />
      </div>
    </div>
  );
}

export default function Afiliados() {
  const [preset, setPreset] = useState<Preset>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const q = useAffiliates({ from, to });
  const [selected, setSelected] = useState<string | null>(null);
  const resumo = q.data?.resumo;
  const chart = q.data?.chart ?? [];
  const conversao = q.data?.conversao;
  const affiliates: Affiliate[] = q.data?.affiliates ?? [];

  function applyPreset(p: Preset) {
    if (p === 'all') {
      setPreset('all');
      setFrom('');
      setTo('');
    } else if (p === '7' || p === '30' || p === '90') {
      const r = presetRange(Number(p));
      setPreset(p);
      setFrom(r.from);
      setTo(r.to);
    }
  }

  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground">Receita</span> = quanto cada pessoa vendeu (valor
          bruto). <span className="text-foreground">Comissão</span> = quanto ela ganhou. Clique numa
          linha pra ver os detalhes.
        </p>
      </div>

      <FilterBar
        preset={preset}
        from={from}
        to={to}
        onPreset={applyPreset}
        onFrom={(v) => {
          setFrom(v);
          setPreset('custom');
        }}
        onTo={(v) => {
          setTo(v);
          setPreset('custom');
        }}
      />

      {q.isLoading ? (
        <div className="rounded-md border border-border/60 p-8 text-center text-muted-foreground">
          Carregando…
        </div>
      ) : q.isError ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          Erro ao buscar vendas: {(q.error as Error).message}
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-3 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Faturamento
                </div>
                <div className="text-3xl font-bold tracking-tight">
                  {formatBRL(resumo?.totalFaturado ?? 0)}
                </div>
                <div className="mt-3">
                  <RevenueChart data={chart} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Conversão de pagamento
                </div>
                <div className="mt-1 text-center">
                  <div className="text-3xl font-bold tracking-tight">{pct(conversao?.geral ?? null)}</div>
                  <div className="text-xs text-muted-foreground">Taxa geral de conversão</div>
                </div>
                <div className="mt-3 divide-y divide-border/60">
                  {(conversao?.porPagamento ?? []).map((p) => (
                    <div key={p.method} className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm font-medium">{prettyMethod(p.method)}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.approved}/{p.attempts}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">{pct(p.rate)}</div>
                    </div>
                  ))}
                  {(conversao?.porPagamento?.length ?? 0) === 0 && (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      Sem dados de checkout ainda.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            <SummaryCard
              icon={<Receipt className="h-5 w-5" />}
              label="Nº de vendas"
              value={String(resumo?.numVendas ?? 0)}
            />
            <SummaryCard
              icon={<DollarSign className="h-5 w-5" />}
              label="Ticket médio"
              value={formatBRL(resumo?.ticketMedio ?? 0)}
            />
            <SummaryCard
              icon={<Award className="h-5 w-5" />}
              label="Afiliados externos"
              value={String(affiliates.filter((a) => a.tipo === 'afiliado').length)}
            />
          </div>

          <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Comissão por pessoa
          </div>

          {affiliates.length === 0 ? (
            <div className="rounded-md border border-border/60 p-8 text-center text-muted-foreground">
              Nenhuma venda ainda.
            </div>
          ) : (
            <div className="rounded-md border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Pessoa</TableHead>
                    <TableHead className="text-right">Válidas</TableHead>
                    <TableHead className="text-right">Vendas</TableHead>
                    <TableHead className="text-right">Canceladas</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((a, i) => (
                    <TableRow
                      key={a.key}
                      onClick={() => setSelected(a.key)}
                      className="cursor-pointer"
                    >
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="break-all font-medium">{a.label}</TableCell>
                      <TableCell className="text-right font-semibold">{a.validas}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{a.vendas}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {a.canceladas || '—'}
                      </TableCell>
                      <TableCell className="text-right">{formatBRL(a.receita)}</TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(a.comissao)}</TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <AffiliateDetailDialog affKey={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}

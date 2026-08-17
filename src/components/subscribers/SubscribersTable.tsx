import { AlertTriangle, Check, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBRL, formatDate } from '@/lib/formatters';
import { useToggleRevoke } from '@/hooks/useSubscribers';
import type { OrderBump, Subscriber } from '@/types/subscriber';
import { CopyButton } from './CopyButton';
import { CredentialsForm } from './CredentialsForm';
import { ProvisionButton } from './ProvisionButton';
import { SendEmailButton } from './SendEmailButton';
import { StatusBadge } from './StatusBadge';

function whatsappUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  const with55 = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${with55}`;
}

function formatPhoneBR(phone: string | null | undefined): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  // 5511999998888 -> +55 (11) 99999-8888
  const only = digits.startsWith('55') ? digits.slice(2) : digits;
  if (only.length === 11) {
    return `+55 (${only.slice(0, 2)}) ${only.slice(2, 7)}-${only.slice(7)}`;
  }
  if (only.length === 10) {
    return `+55 (${only.slice(0, 2)}) ${only.slice(2, 6)}-${only.slice(6)}`;
  }
  return phone;
}

function BumpChip({ bump }: { bump: OrderBump }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-foreground">
      <span className="text-accent">+</span>
      {bump.name ?? '(sem nome)'}
      {bump.price ? (
        <span className="text-muted-foreground">· R$ {String(bump.price)}</span>
      ) : null}
    </span>
  );
}

function PhoneCell({ phone }: { phone: string | null }) {
  const wa = whatsappUrl(phone);
  if (!phone) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{formatPhoneBR(phone)}</span>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir conversa no WhatsApp"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 transition-colors hover:bg-emerald-500/25"
        >
          <WhatsAppIcon className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

function CopyTutorialLink({
  url,
  phone,
  nome,
}: {
  url: string;
  phone: string | null;
  nome: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link do tutorial copiado!');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Não consegui copiar o link.');
    }
  }

  const primeiroNome = nome?.trim().split(/\s+/)[0] ?? '';
  const msg =
    `Oi ${primeiroNome}! Seu acesso do CineRush TV está pronto 🎬 ` +
    `É só abrir esse link e seguir o passo a passo pra configurar no seu aparelho: ${url}`;
  const wa = whatsappUrl(phone);
  const waComTexto = wa ? `${wa}?text=${encodeURIComponent(msg)}` : null;

  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Link do tutorial de configuração
      </div>
      <div className="mt-1 truncate text-xs text-muted-foreground" title={url}>
        {url}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={copy}>
          {copied ? <Check className="text-emerald-400" /> : <Copy />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </Button>
        {waComTexto && (
          <a
            href={waComTexto}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/25"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Mandar no WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

function SubscriberRow({ subscriber }: { subscriber: Subscriber }) {
  const [open, setOpen] = useState(false);
  const revokeMut = useToggleRevoke(subscriber.id);

  const alerta =
    (subscriber.status === 'reembolsado' || subscriber.status === 'cancelado') &&
    subscriber.data_envio_email &&
    !subscriber.access_revoked_at;

  return (
    <>
      <TableRow
        className={
          alerta
            ? 'border-red-500/40 bg-red-500/5'
            : subscriber.status === 'reembolsado'
              ? 'bg-red-500/5'
              : ''
        }
      >
        <TableCell className="w-8">
          <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} className="h-7 w-7">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <span>{subscriber.nome}</span>
            {alerta && (
              <span title="Email já foi enviado mas o acesso ainda não foi revogado no Havok">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-foreground">{subscriber.plano}</span>
            {subscriber.order_bumps.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {subscriber.order_bumps.map((b, i) => (
                  <BumpChip key={b.id ?? `${b.name}-${i}`} bump={b} />
                ))}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatBRL(subscriber.valor_total, subscriber.valor_total_raw)}
        </TableCell>
        <TableCell className="text-muted-foreground">{formatDate(subscriber.data_compra)}</TableCell>
        <TableCell>
          <StatusBadge subscriber={subscriber} />
        </TableCell>
      </TableRow>

      {open && (
        <TableRow>
          <TableCell colSpan={6} className="bg-surface-elevated/50 p-0">
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Dados pra criar no Havok
                </h3>
                <dl className="space-y-3 rounded-md border border-border/60 bg-background/40 p-4 text-sm">
                  <Field label="Nome" value={subscriber.nome} />
                  <Field label="Email" value={subscriber.email} />
                  <PhoneField phone={subscriber.telefone} />
                  <PlanoField plano={subscriber.plano} bumps={subscriber.order_bumps} />
                  <Field label="Data da compra" value={formatDate(subscriber.data_compra)} />
                  {subscriber.email_error_last && (
                    <div className="rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
                      Último erro de email: {subscriber.email_error_last}
                    </div>
                  )}
                </dl>
              </section>

              <section className="space-y-4">
                {subscriber.config_url && (
                  <CopyTutorialLink
                    url={subscriber.config_url}
                    phone={subscriber.telefone}
                    nome={subscriber.nome}
                  />
                )}

                <ProvisionButton subscriber={subscriber} />

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Ou preencher manualmente
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cole aqui o que o Havok gerou. A senha é criptografada antes de salvar.
                  </p>
                </div>
                <CredentialsForm subscriber={subscriber} />

                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <div className="text-xs text-muted-foreground">
                    Tentativas de envio: {subscriber.email_send_attempts}
                    {subscriber.data_envio_email && (
                      <> · último em {formatDate(subscriber.data_envio_email)}</>
                    )}
                  </div>
                  <SendEmailButton subscriber={subscriber} />
                </div>

                {alerta && (
                  <div className="flex items-center justify-between rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm">
                    <span>Compra estornada mas o acesso ainda não foi revogado.</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await revokeMut.mutateAsync(true);
                          toast.success('Marcado como revogado.');
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : 'falhou');
                        }
                      }}
                    >
                      Marcar como revogado
                    </Button>
                  </div>
                )}
              </section>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 break-words">{value}</dd>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

function PhoneField({ phone }: { phone: string | null }) {
  const wa = whatsappUrl(phone);
  const displayed = phone ? formatPhoneBR(phone) : '—';
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">Telefone</dt>
        <dd className="mt-0.5 flex items-center gap-2 break-words">
          <span>{displayed}</span>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/25"
            >
              <WhatsAppIcon className="h-3 w-3" />
              WhatsApp
            </a>
          )}
        </dd>
      </div>
      {phone && <CopyButton value={phone} label="Telefone" />}
    </div>
  );
}

function PlanoField({ plano, bumps }: { plano: string; bumps: OrderBump[] }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">Plano</dt>
      <dd className="mt-1 space-y-2">
        <div className="text-base font-semibold text-foreground">{plano}</div>
        {bumps.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bumps.map((b, i) => (
              <BumpChip key={b.id ?? `${b.name}-${i}`} bump={b} />
            ))}
          </div>
        )}
      </dd>
    </div>
  );
}

export function SubscribersTable({ data }: { data: Subscriber[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-md border border-border/60 bg-background/40 p-8 text-center text-muted-foreground">
        Nenhum assinante encontrado com esses filtros.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Nome</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((s) => (
            <SubscriberRow key={s.id} subscriber={s} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

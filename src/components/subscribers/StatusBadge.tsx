import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Subscriber, SubscriberStatus } from '@/types/subscriber';

const LABELS: Record<SubscriberStatus, string> = {
  pendente: 'Pendente',
  credenciais_preenchidas: 'Aguardando envio',
  email_enviado: 'Email enviado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
};

const CLASSES: Record<SubscriberStatus, string> = {
  pendente: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  credenciais_preenchidas: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  email_enviado: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelado: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  reembolsado: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const scheduledFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function StatusBadge({ subscriber }: { subscriber: Subscriber }) {
  const isScheduled =
    !!subscriber.email_scheduled_at && subscriber.status !== 'email_enviado';
  if (isScheduled) {
    const label = `Agendado ${scheduledFmt.format(new Date(subscriber.email_scheduled_at!))}`;
    return (
      <Badge
        variant="outline"
        className="gap-1 border-amber-500/30 bg-amber-500/15 text-amber-300"
      >
        <Clock className="h-3 w-3" />
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={CLASSES[subscriber.status]}>
      {LABELS[subscriber.status]}
    </Badge>
  );
}

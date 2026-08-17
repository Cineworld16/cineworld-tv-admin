import { Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { useSendEmail } from '@/hooks/useSubscribers';
import type { Subscriber } from '@/types/subscriber';

export function SendEmailButton({ subscriber }: { subscriber: Subscriber }) {
  const enabled = subscriber.status === 'credenciais_preenchidas' || subscriber.status === 'email_enviado';
  const sender = useSendEmail(subscriber.id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function tryOnce(force = false) {
    try {
      await sender.mutateAsync({ force });
      toast.success(force ? 'Email reenviado.' : 'Email enviado.');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'email_already_sent') {
        setConfirmOpen(true);
        return;
      }
      const msg = err instanceof Error ? err.message : 'falha inesperada';
      toast.error(msg);
    }
  }

  return (
    <>
      <Button
        variant="default"
        disabled={!enabled || sender.isPending}
        onClick={() => tryOnce(false)}
      >
        {sender.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        {subscriber.status === 'email_enviado' ? 'Reenviar email' : 'Enviar email de acesso'}
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reenviar email de acesso?</AlertDialogTitle>
            <AlertDialogDescription>
              Já enviamos em{' '}
              <strong>{formatDate(subscriber.data_envio_email)}</strong>. Confirma que
              quer mandar de novo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setConfirmOpen(false);
                await tryOnce(true);
              }}
            >
              Sim, reenviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

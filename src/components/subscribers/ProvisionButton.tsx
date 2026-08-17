import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useProvision } from '@/hooks/useSubscribers';
import type { Subscriber } from '@/types/subscriber';

/**
 * Dispara a automação completa: cria a conta no Havok, salva credenciais e
 * envia o email — tudo num clique. Some quando o acesso já foi enviado.
 */
export function ProvisionButton({ subscriber }: { subscriber: Subscriber }) {
  const provision = useProvision(subscriber.id);
  if (subscriber.status === 'email_enviado') return null;

  async function handle() {
    try {
      await provision.mutateAsync();
      toast.success('Acesso criado no Havok e email enviado!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'falhou';
      toast.error(`Automação falhou: ${msg}. Você ainda pode fazer manual abaixo.`);
    }
  }

  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Zap className="h-4 w-4 text-primary" />
            Provisionar automático
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Cria a conta no Havok e envia o email sozinho. Sem precisar colar nada.
          </p>
        </div>
        <Button onClick={handle} disabled={provision.isPending}>
          {provision.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando…
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Gerar e enviar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

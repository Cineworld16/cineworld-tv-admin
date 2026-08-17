import { Copy, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCredentials, useSaveCredentials } from '@/hooks/useSubscribers';
import { toast } from 'sonner';
import type { Subscriber } from '@/types/subscriber';

export function CredentialsForm({ subscriber }: { subscriber: Subscriber }) {
  const preenchida = subscriber.senha_preenchida;
  const [usuario, setUsuario] = useState(subscriber.usuario ?? '');
  const [senha, setSenha] = useState('');

  // Busca automática: se já tem credencial salva, revela na hora que a linha abre.
  const credsQ = useCredentials(subscriber.id, preenchida);
  const save = useSaveCredentials(subscriber.id);

  useEffect(() => {
    if (credsQ.data) {
      setUsuario(credsQ.data.usuario);
      setSenha(credsQ.data.senha);
    }
  }, [credsQ.data]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario.trim() || !senha) {
      toast.error('Usuário e senha são obrigatórios.');
      return;
    }
    try {
      await save.mutateAsync({ usuario: usuario.trim(), senha });
      toast.success('Credenciais salvas.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falhou ao salvar.');
    }
  }

  async function copyValue(value: string, label: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado.`);
    } catch {
      toast.error(`Não consegui copiar ${label.toLowerCase()}.`);
    }
  }

  const loading = credsQ.isFetching && !credsQ.data;

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`usuario-${subscriber.id}`}>Usuário (Havok)</Label>
          <div className="relative">
            <Input
              id={`usuario-${subscriber.id}`}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder={loading ? 'buscando…' : 'cole o usuário gerado no Havok'}
              autoComplete="off"
              className="pr-9"
            />
            {usuario && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => copyValue(usuario, 'Usuário')}
                className="absolute right-1 top-1 h-8 w-8"
                title="Copiar usuário"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`senha-${subscriber.id}`}>Senha (Havok)</Label>
          <div className="relative">
            <Input
              id={`senha-${subscriber.id}`}
              type="text"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={loading ? 'buscando…' : 'cole a senha gerada'}
              autoComplete="off"
              className="pr-9 font-mono"
            />
            {senha && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => copyValue(senha, 'Senha')}
                className="absolute right-1 top-1 h-8 w-8"
                title="Copiar senha"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar credenciais
        </Button>
      </div>
    </form>
  );
}

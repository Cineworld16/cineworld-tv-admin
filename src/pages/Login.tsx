import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Login é por usuário (ex.: "teus"); o sistema completa com este domínio pro Supabase Auth.
const ADMIN_DOMAIN = 'cinerush.tv';

export default function Login() {
  const { session, loading } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const u = usuario.trim().toLowerCase();
    const email = u.includes('@') ? u : `${u}@${ADMIN_DOMAIN}`;
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: senha });
    setSubmitting(false);
    if (err) {
      setError(
        /invalid login credentials/i.test(err.message)
          ? 'Usuário ou senha incorretos.'
          : err.message,
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/60 bg-card/60 backdrop-blur">
        <CardHeader className="items-center text-center">
          <Logo variant="full" className="h-10" textClassName="text-2xl" />
          <CardTitle className="mt-4 text-xl">Painel administrativo</CardTitle>
          <CardDescription>Login restrito à equipe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <Input
                id="usuario"
                type="text"
                autoComplete="username"
                placeholder="teus"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

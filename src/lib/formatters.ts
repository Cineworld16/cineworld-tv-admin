const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return dateFmt.format(new Date(iso));
  } catch {
    return '—';
  }
}

export function formatBRL(v: number | null | undefined, raw?: string | null): string {
  if (v == null) return raw ?? '—';
  return brl.format(v);
}

# CineRush TV — Admin

Dashboard interno pra gerenciar assinantes recebidos da Kirvano.

- Stack: Vite + React 18 + TS + Tailwind + shadcn/ui + TanStack Query + Supabase Auth.
- Backend: `../cinerush-tv-backend` (endpoints `/api/admin/*`).
- **Não** é público. Rotas atrás de `ProtectedRoute` + backend valida email na allowlist `ADMIN_EMAILS`.

## Setup local

```bash
npm install
cp .env.example .env
# preencher .env
npm run dev
# abre em http://localhost:8081
```

O backend precisa estar rodando em `VITE_API_BASE_URL` (default `http://localhost:3000`).

## Como um admin loga

1. Alguém com acesso ao Supabase cria o usuário: Auth → Users → Add user → email/senha.
2. O email tem que estar em `ADMIN_EMAILS` do backend (se não, backend devolve 403 depois do login).
3. Abrir `/login`, colocar email/senha.

## Fluxo de trabalho

1. Kirvano dispara webhook → assinante aparece na tabela com status **Pendente**.
2. Clicar na seta (▸) da linha pra expandir. Copiar nome/email/telefone com os botões 📋.
3. Criar o usuário no painel **Havok** com esses dados.
4. Colar `Usuário` e `Senha` gerados no Havok, clicar **Salvar credenciais** → status vira **Credenciais**.
5. Clicar **Enviar email de acesso** → status vira **Email enviado**.
6. Se a Kirvano depois disparar reembolso/chargeback, a linha fica em **vermelho** com aviso pra revogar o acesso no Havok manualmente. Ticar em **Marcar como revogado** depois de revogar.

## Reenvio de email

Se clicar Enviar de novo depois que já foi enviado, aparece um diálogo pra confirmar. Ao confirmar, o backend força reenvio e incrementa `email_send_attempts`.

## Deploy Railway

Nixpacks auto-detecta. Setar as 3 vars do `.env.example`. Start command: `npm run start` (serve `dist/` via `vite preview` na porta `$PORT`).

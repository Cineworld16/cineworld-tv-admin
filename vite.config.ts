import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// Content-Security-Policy do admin (aplicada no `vite preview` = servidor de prod).
// script-src 'self' SEM 'unsafe-inline' = blindagem de XSS: script injetado inline
// nao executa, então mesmo com o token no localStorage não dá pra exfiltrar via XSS.
// style-src precisa de 'unsafe-inline' (Radix/shadcn aplicam estilos inline).
// connect-src libera Supabase (login) e o backend (dados) — sem isso o app quebra.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://joylgjdlscyglxuvurcf.supabase.co https://cineworld-tv-backend-production.up.railway.app http://localhost:3000",
].join('; ');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@tanstack/react-query',
    ],
  },
  server: {
    host: '::',
    port: 8081,
  },
  preview: {
    host: '::',
    port: 8081,
    allowedHosts: true,
    // Security headers no servidor de produção (Railway usa `vite preview`).
    // Admin lida com credenciais → nunca deve ser embutido em frame.
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      'Content-Security-Policy': csp,
    },
  },
});

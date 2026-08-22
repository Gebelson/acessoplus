# Acesso+

MVP web da Acesso+ com landing page de alta conversão, checkout conversacional, acompanhamento visual de pedido e painel operacional demonstrativo.

## O que já funciona

- Landing responsiva com oferta, benefícios, processo, vídeo, preço e FAQ.
- Checkout em formato de chat com criação de sessão imprevisível no navegador.
- Coleta guiada de nome, e-mail e contato opcional.
- Pedido demonstrativo, fluxo de pagamento seguro simulado e timeline de entrega.
- Retorno à conversa no mesmo dispositivo via `localStorage`.
- Painel demonstrativo com métricas, modos Online/Fila/Pausado, pedidos e entrega manual validada.
- SEO, Open Graph, sitemap, robots e páginas privadas marcadas como `noindex`.
- Interfaces desacopladas para fornecedor, pagamento cripto e orquestração de agentes.

## Importante

O deploy público é um MVP demonstrativo. Pagamento, banco, autenticação, e-mail, webhooks e fulfillment real ficam bloqueados até que provedores e credenciais de produção sejam configurados. Nenhuma ação financeira é validada apenas pelo frontend.

## Desenvolvimento

```bash
npm install
npm run dev
```

O projeto também possui `npm run build:vercel` para o build Next.js usado pela Vercel.

## Próximas integrações

1. PostgreSQL/Supabase com autenticação administrativa e Row Level Security.
2. Gateway Pix/cartão com webhook assinado e idempotente.
3. Resend para notificações de pedido e entrega.
4. Realtime via Supabase ou SSE.
5. Fornecedor e Telegram por adaptadores implementando `SupplierProvider`.
6. n8n e módulo orgânico por `AgentOrchestratorProvider`.

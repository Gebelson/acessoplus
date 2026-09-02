# Acesso+

Site da Acesso+ com landing page, checkout conversacional, acompanhamento de pedido e painel operacional conectado a dados persistentes.

## O que já funciona

- Landing responsiva com oferta, benefícios, processo, vídeo, preço e FAQ.
- Checkout em formato de chat com criação de sessão imprevisível e pedido persistido no PostgreSQL.
- Coleta guiada de nome, e-mail e contato opcional.
- Pagamento na Cakto com correlação do pedido pelo parâmetro `sck`.
- Atualização de pagamento por webhook autenticado e idempotente.
- Retorno à conversa pelo link em qualquer dispositivo.
- Painel autenticado com métricas reais, busca, conversa, atribuição, status, entrega e auditoria.
- SEO, Open Graph, sitemap, robots e páginas privadas marcadas como `noindex`.

## Importante

O deploy precisa das variáveis descritas em `.env.example`. O painel não gera dados fictícios: quando o banco ou uma integração não está configurada, a interface informa a indisponibilidade em vez de simular resultados.

O schema PostgreSQL é criado de forma idempotente na primeira operação. Para receber eventos reais, cadastre na Cakto a URL `https://SEU_DOMINIO/api/webhooks/cakto` com os eventos de compra, cobrança, reembolso e chargeback e salve o segredo gerado em `CAKTO_WEBHOOK_SECRET`.

## Desenvolvimento

```bash
npm install
npm run dev
```

O projeto também possui `npm run build:vercel` para o build Next.js usado pela Vercel.

## Variáveis obrigatórias

- `DATABASE_URL`: conexão PostgreSQL compatível com Neon/Vercel.
- `ADMIN_ACCOUNTS`: lista JSON protegida com as contas autorizadas no formato `[{"email":"...","password":"..."}]`.
- `ADMIN_EMAIL` e `ADMIN_PASSWORD`: alternativa legada para instalações com apenas uma conta.
- `ADMIN_SESSION_SECRET`: segredo aleatório com pelo menos 32 bytes.
- `CAKTO_WEBHOOK_SECRET`: segredo exibido ao criar o webhook na Cakto.

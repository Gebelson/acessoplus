import { requireEnv } from '@/lib/config';
import { database, ensureSchema, publicOrderId } from '@/lib/database';

type WebhookPayload = {
  secret?: string;
  event?: string;
  data?: Record<string, unknown> & {
    id?: string;
    refId?: string;
    status?: string;
    baseAmount?: number;
    paymentMethod?: string;
    paidAt?: string;
    sck?: string;
    customer?: { name?: string; email?: string; phone?: string };
  };
};

const encoder = new TextEncoder();
function safeEqual(left: string, right: string) {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a[index] ^ b[index];
  return mismatch === 0;
}

function eventState(event: string) {
  if (event === 'purchase_approved') return { payment: 'PAYMENT_CONFIRMED', delivery: 'FULFILLMENT_PENDING', message: 'Pagamento confirmado. Sua ativação será iniciada.' };
  if (event === 'purchase_refused') return { payment: 'PAYMENT_FAILED', delivery: 'REVIEW_REQUIRED', message: 'O pagamento não foi aprovado. Confira os dados na Cakto ou tente novamente.' };
  if (event === 'refund' || event === 'chargeback') return { payment: 'PAYMENT_REFUNDED', delivery: 'REVIEW_REQUIRED', message: 'O pagamento deste pedido foi estornado e precisa de revisão.' };
  return { payment: 'WAITING_PAYMENT', delivery: 'NEW', message: 'A cobrança foi criada e está aguardando a confirmação do pagamento.' };
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as WebhookPayload | null;
  let expectedSecret: string;
  try { expectedSecret = requireEnv('CAKTO_WEBHOOK_SECRET'); } catch { return Response.json({ error: 'Webhook não configurado.' }, { status: 503 }); }
  if (!payload?.secret || !safeEqual(payload.secret, expectedSecret)) {
    return Response.json({ error: 'Origem não autorizada.' }, { status: 401 });
  }
  const event = payload.event ?? '';
  const data = payload.data;
  const providerOrderId = String(data?.id ?? '').trim();
  if (!providerOrderId || !event) return Response.json({ error: 'Evento inválido.' }, { status: 400 });
  const supported = ['initiate_checkout', 'checkout_abandonment', 'purchase_approved', 'purchase_refused', 'pix_gerado', 'boleto_gerado', 'picpay_gerado', 'openfinance_nubank_gerado', 'refund', 'chargeback'];
  if (!supported.includes(event)) return Response.json({ accepted: true, ignored: true });

  try {
    await ensureSchema();
    const sql = database();
    const sck = String(data?.sck ?? '').trim();
    const email = data?.customer?.email?.trim().toLowerCase() ?? '';
    let orders = sck ? await sql.query(`SELECT id FROM orders WHERE id = $1 LIMIT 1`, [sck]) : [];
    if (!orders[0] && email) {
      orders = await sql.query(`SELECT id FROM orders WHERE lower(customer_email) = $1 AND payment_status = 'WAITING_PAYMENT' ORDER BY created_at DESC LIMIT 1`, [email]);
    }
    let orderId = orders[0]?.id as string | undefined;
    if (!orderId) {
      orderId = publicOrderId();
      await sql.query(`INSERT INTO orders (id, conversation_id, customer_name, customer_email, customer_phone, amount_cents, provider_order_id, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
        orderId,
        `cakto_${providerOrderId}`,
        data?.customer?.name?.trim() || 'Cliente Cakto',
        email || `pedido-${providerOrderId}@cakto.local`,
        data?.customer?.phone?.trim() || null,
        Math.max(0, Math.round(Number(data?.baseAmount ?? 67.9) * 100)),
        providerOrderId,
        data?.paymentMethod ? String(data.paymentMethod) : null,
      ]);
    }
    const state = eventState(event);
    const paidAt = event === 'purchase_approved' ? (data?.paidAt ? String(data.paidAt) : new Date().toISOString()) : null;
    await sql.transaction((tx) => [
      tx.query(`INSERT INTO webhook_events (id, provider_order_id, order_id, event_name, payload) VALUES ($1, $2, $3, $4, $5::jsonb) ON CONFLICT (id) DO NOTHING`, [`cakto:${event}:${providerOrderId}`, providerOrderId, orderId, event, JSON.stringify(payload)]),
      tx.query(`UPDATE orders SET payment_status = $1, fulfillment_status = CASE WHEN fulfillment_status = 'DELIVERED' THEN fulfillment_status ELSE $2 END,
        provider_order_id = $3, payment_method = coalesce($4, payment_method), paid_at = coalesce($5::timestamptz, paid_at), updated_at = now() WHERE id = $6`,
        [state.payment, state.delivery, providerOrderId, data?.paymentMethod ? String(data.paymentMethod) : null, paidAt, orderId]),
      tx.query(`INSERT INTO messages (id, order_id, sender, content) VALUES ($1, $2, 'system', $3) ON CONFLICT (id) DO NOTHING`, [`cakto:${event}:${providerOrderId}`, orderId, state.message]),
      tx.query(`INSERT INTO audit_logs (id, order_id, action, actor, details) VALUES ($1, $2, $3, 'cakto', $4::jsonb) ON CONFLICT (id) DO NOTHING`, [`audit:cakto:${event}:${providerOrderId}`, orderId, `CAKTO_${event.toUpperCase()}`, JSON.stringify({ providerOrderId })]),
    ]);
    return Response.json({ accepted: true });
  } catch (error) {
    console.error('cakto webhook error', error);
    return Response.json({ error: 'Falha ao processar evento.' }, { status: 500 });
  }
}

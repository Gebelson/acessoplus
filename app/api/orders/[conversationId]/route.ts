import { database, ensureSchema, recordId } from '@/lib/database';

export const dynamic = 'force-dynamic';

function validConversationId(value: string) {
  return value.length >= 12 && value.length <= 100 && /^[a-zA-Z0-9_-]+$/.test(value);
}

export async function GET(_request: Request, context: RouteContext<'/api/orders/[conversationId]'>) {
  const { conversationId } = await context.params;
  if (!validConversationId(conversationId)) return Response.json({ error: 'Conversa inválida.' }, { status: 400 });
  try {
    await ensureSchema();
    const sql = database();
    const rows = await sql.query(`SELECT id, customer_name, customer_email, customer_phone, amount_cents,
      payment_status, fulfillment_status, payment_method, delivery_url, created_at, paid_at, delivered_at
      FROM orders WHERE conversation_id = $1 LIMIT 1`, [conversationId]);
    if (!rows[0]) return Response.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    const messages = await sql.query(`SELECT id, sender, content, created_at FROM messages WHERE order_id = $1 ORDER BY created_at ASC`, [rows[0].id]);
    return Response.json({ order: rows[0], messages });
  } catch (error) {
    console.error('load order error', error);
    return Response.json({ error: 'Não foi possível carregar o pedido.' }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext<'/api/orders/[conversationId]'>) {
  const { conversationId } = await context.params;
  if (!validConversationId(conversationId)) return Response.json({ error: 'Conversa inválida.' }, { status: 400 });
  const body = await request.json().catch(() => null) as { id?: string; content?: string } | null;
  const content = body?.content?.trim().slice(0, 3000);
  if (!content) return Response.json({ error: 'Mensagem vazia.' }, { status: 400 });
  try {
    await ensureSchema();
    const sql = database();
    const orders = await sql.query(`SELECT id FROM orders WHERE conversation_id = $1 LIMIT 1`, [conversationId]);
    if (!orders[0]) return Response.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    const id = body?.id?.trim().slice(0, 180) || recordId('msg');
    await sql.transaction((tx) => [
      tx.query(`INSERT INTO messages (id, order_id, sender, content) VALUES ($1, $2, 'customer', $3) ON CONFLICT (id) DO NOTHING`, [id, orders[0].id, content]),
      tx.query(`UPDATE orders SET updated_at = now() WHERE id = $1`, [orders[0].id]),
    ]);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    console.error('save message error', error);
    return Response.json({ error: 'Não foi possível enviar a mensagem.' }, { status: 500 });
  }
}

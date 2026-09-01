import { getAdminSession } from '@/lib/admin-auth';
import { getOrderMessages } from '@/lib/admin-data';
import { database, ensureSchema, recordId } from '@/lib/database';

export const dynamic = 'force-dynamic';

async function authorized() {
  return Boolean(await getAdminSession());
}

export async function GET(_request: Request, context: RouteContext<'/api/admin/orders/[orderId]'>) {
  if (!(await authorized())) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  const { orderId } = await context.params;
  try {
    return Response.json({ messages: await getOrderMessages(orderId) });
  } catch (error) {
    console.error('admin order messages error', error);
    return Response.json({ error: 'Não foi possível carregar a conversa.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext<'/api/admin/orders/[orderId]'>) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  const { orderId } = await context.params;
  const body = await request.json().catch(() => null) as {
    action?: 'assign' | 'message' | 'deliver' | 'status';
    content?: string;
    deliveryUrl?: string;
    fulfillmentStatus?: string;
  } | null;
  if (!body?.action) return Response.json({ error: 'Ação inválida.' }, { status: 400 });

  await ensureSchema();
  const sql = database();
  const now = new Date().toISOString();
  try {
    if (body.action === 'assign') {
      await sql.transaction((tx) => [
        tx.query(`UPDATE orders SET assigned_to = $1, fulfillment_status = CASE WHEN fulfillment_status = 'FULFILLMENT_PENDING' THEN 'IN_PROGRESS' ELSE fulfillment_status END, updated_at = now() WHERE id = $2`, [session.email, orderId]),
        tx.query(`INSERT INTO audit_logs (id, order_id, action, actor, details) VALUES ($1, $2, 'ORDER_ASSIGNED', $3, $4::jsonb)`, [recordId('audit'), orderId, session.email, JSON.stringify({ at: now })]),
      ]);
    } else if (body.action === 'message') {
      const content = body.content?.trim().slice(0, 3000);
      if (!content) return Response.json({ error: 'Digite uma mensagem.' }, { status: 400 });
      await sql.transaction((tx) => [
        tx.query(`INSERT INTO messages (id, order_id, sender, content) VALUES ($1, $2, 'admin', $3)`, [recordId('msg'), orderId, content]),
        tx.query(`UPDATE orders SET updated_at = now() WHERE id = $1`, [orderId]),
        tx.query(`INSERT INTO audit_logs (id, order_id, action, actor, details) VALUES ($1, $2, 'MESSAGE_SENT', $3, $4::jsonb)`, [recordId('audit'), orderId, session.email, JSON.stringify({ length: content.length })]),
      ]);
    } else if (body.action === 'deliver') {
      const value = body.deliveryUrl?.trim();
      if (!value) return Response.json({ error: 'Informe o link de acesso.' }, { status: 400 });
      let deliveryUrl: URL;
      try { deliveryUrl = new URL(value); } catch { return Response.json({ error: 'Link de acesso inválido.' }, { status: 400 }); }
      if (deliveryUrl.protocol !== 'https:') return Response.json({ error: 'O link de acesso precisa usar HTTPS.' }, { status: 400 });
      const message = `Seu acesso está pronto: ${deliveryUrl.toString()}`;
      await sql.transaction((tx) => [
        tx.query(`UPDATE orders SET delivery_url = $1, fulfillment_status = 'DELIVERED', delivered_at = now(), updated_at = now() WHERE id = $2 AND fulfillment_status <> 'DELIVERED'`, [deliveryUrl.toString(), orderId]),
        tx.query(`INSERT INTO messages (id, order_id, sender, content) VALUES ($1, $2, 'assistant', $3) ON CONFLICT (id) DO NOTHING`, [`delivery:${orderId}`, orderId, message]),
        tx.query(`INSERT INTO audit_logs (id, order_id, action, actor, details) VALUES ($1, $2, 'ACCESS_DELIVERED', $3, $4::jsonb)`, [recordId('audit'), orderId, session.email, JSON.stringify({ url: deliveryUrl.toString() })]),
      ]);
    } else if (body.action === 'status') {
      const allowed = ['NEW', 'FULFILLMENT_PENDING', 'IN_PROGRESS', 'REVIEW_REQUIRED'];
      if (!body.fulfillmentStatus || !allowed.includes(body.fulfillmentStatus)) return Response.json({ error: 'Status inválido.' }, { status: 400 });
      await sql.transaction((tx) => [
        tx.query(`UPDATE orders SET fulfillment_status = $1, updated_at = now() WHERE id = $2`, [body.fulfillmentStatus, orderId]),
        tx.query(`INSERT INTO audit_logs (id, order_id, action, actor, details) VALUES ($1, $2, 'STATUS_CHANGED', $3, $4::jsonb)`, [recordId('audit'), orderId, session.email, JSON.stringify({ status: body.fulfillmentStatus })]),
      ]);
    }
    const rows = await sql.query(`SELECT * FROM orders WHERE id = $1 LIMIT 1`, [orderId]);
    if (!rows[0]) return Response.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    return Response.json({ order: rows[0], messages: await getOrderMessages(orderId) });
  } catch (error) {
    console.error('admin order mutation error', error);
    return Response.json({ error: 'Não foi possível concluir a ação.' }, { status: 500 });
  }
}

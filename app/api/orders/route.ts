import { database, ensureSchema, publicOrderId, recordId } from '@/lib/database';

type InputMessage = { id?: string; sender?: string; content?: string };

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    conversationId?: string;
    name?: string;
    email?: string;
    phone?: string;
    messages?: InputMessage[];
  } | null;
  const conversationId = clean(body?.conversationId, 100);
  const name = clean(body?.name, 160);
  const email = clean(body?.email, 254).toLowerCase();
  const phone = clean(body?.phone, 40);
  if (!conversationId || conversationId.length < 12 || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Dados do pedido incompletos.' }, { status: 400 });
  }

  try {
    await ensureSchema();
    const sql = database();
    const settings = await sql.query(`SELECT value FROM admin_settings WHERE key = 'operation_mode' LIMIT 1`);
    if (settings[0]?.value === 'PAUSED') {
      return Response.json({ error: 'As ativações estão temporariamente pausadas. Tente novamente em breve.' }, { status: 503 });
    }
    const existing = await sql.query(`SELECT id FROM orders WHERE conversation_id = $1 LIMIT 1`, [conversationId]);
    if (existing[0]) return Response.json({ orderId: existing[0].id, created: false });

    let orderId = publicOrderId();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const collision = await sql.query(`SELECT 1 FROM orders WHERE id = $1`, [orderId]);
      if (!collision[0]) break;
      orderId = publicOrderId();
    }
    const messages = Array.isArray(body?.messages)
      ? body.messages.slice(0, 60).flatMap((message) => {
          const sender = ['assistant', 'customer', 'system'].includes(String(message.sender)) ? String(message.sender) : '';
          const content = clean(message.content, 3000);
          if (!sender || !content) return [];
          return [{ id: clean(message.id, 180) || recordId('msg'), sender, content }];
        })
      : [];
    await sql.transaction((tx) => [
      tx.query(`INSERT INTO orders (id, conversation_id, customer_name, customer_email, customer_phone, fulfillment_status) VALUES ($1, $2, $3, $4, $5, 'NEW')`, [orderId, conversationId, name, email, phone || null]),
      ...messages.map((message) => tx.query(`INSERT INTO messages (id, order_id, sender, content) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`, [message.id, orderId, message.sender, message.content])),
      tx.query(`INSERT INTO messages (id, order_id, sender, content) VALUES ($1, $2, 'system', $3) ON CONFLICT (id) DO NOTHING`, [`order-created:${orderId}`, orderId, `Pedido ${orderId} criado com segurança.`]),
      tx.query(`INSERT INTO audit_logs (id, order_id, action, actor, details) VALUES ($1, $2, 'ORDER_CREATED', 'customer', $3::jsonb)`, [recordId('audit'), orderId, JSON.stringify({ conversationId })]),
    ]);
    return Response.json({ orderId, created: true }, { status: 201 });
  } catch (error) {
    console.error('create order error', error);
    return Response.json({ error: 'Não foi possível criar o pedido agora. Tente novamente.' }, { status: 500 });
  }
}

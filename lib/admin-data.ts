import 'server-only';

import { database, ensureSchema } from './database';

export async function getAdminSnapshot(search = '') {
  await ensureSchema();
  const sql = database();
  const term = search.trim().slice(0, 120);
  const [orders, metrics, chart, settings, activity] = await Promise.all([
    sql.query(`SELECT id, conversation_id, customer_name, customer_email, customer_phone,
      amount_cents, payment_status, fulfillment_status, payment_provider,
      provider_order_id, payment_method, delivery_url, assigned_to,
      created_at, updated_at, paid_at, delivered_at
      FROM orders
      WHERE $1 = '' OR id ILIKE '%' || $1 || '%' OR customer_name ILIKE '%' || $1 || '%'
        OR customer_email ILIKE '%' || $1 || '%'
      ORDER BY created_at DESC LIMIT 200`, [term]),
    sql.query(`SELECT
      count(*) FILTER (WHERE payment_status = 'PAYMENT_CONFIRMED' AND paid_at >= date_trunc('day', now()))::int AS sales_today,
      coalesce(sum(amount_cents) FILTER (WHERE payment_status = 'PAYMENT_CONFIRMED' AND paid_at >= date_trunc('day', now())), 0)::int AS revenue_today,
      count(*) FILTER (WHERE payment_status = 'PAYMENT_CONFIRMED' AND fulfillment_status <> 'DELIVERED')::int AS awaiting_delivery,
      coalesce(round(avg(extract(epoch FROM (delivered_at - paid_at)) / 60) FILTER (WHERE delivered_at IS NOT NULL AND paid_at IS NOT NULL)), 0)::int AS average_delivery_minutes,
      count(*)::int AS total_orders,
      count(*) FILTER (WHERE fulfillment_status = 'REVIEW_REQUIRED')::int AS review_required
      FROM orders`),
    sql.query(`WITH days AS (
      SELECT generate_series(date_trunc('day', now()) - interval '6 days', date_trunc('day', now()), interval '1 day') AS day
    )
    SELECT to_char(days.day, 'YYYY-MM-DD') AS day,
      coalesce(sum(orders.amount_cents) FILTER (WHERE orders.payment_status = 'PAYMENT_CONFIRMED'), 0)::int AS revenue_cents
    FROM days LEFT JOIN orders ON orders.paid_at >= days.day AND orders.paid_at < days.day + interval '1 day'
    GROUP BY days.day ORDER BY days.day`),
    sql.query(`SELECT value FROM admin_settings WHERE key = 'operation_mode' LIMIT 1`),
    sql.query(`SELECT id, order_id, action, actor, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 30`),
  ]);

  return {
    orders,
    metrics: metrics[0] ?? {},
    chart,
    operationMode: settings[0]?.value ?? 'ONLINE',
    activity,
  };
}

export async function getOrderMessages(orderId: string) {
  await ensureSchema();
  return database().query(
    `SELECT id, sender, content, created_at FROM messages WHERE order_id = $1 ORDER BY created_at ASC`,
    [orderId],
  );
}


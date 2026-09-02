import 'server-only';

import postgres, { type ParameterOrJSON, type Sql, type TransactionSql } from 'postgres';
import { requireEnv } from './config';

export type OrderStatus = 'WAITING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'PAYMENT_FAILED' | 'PAYMENT_REFUNDED';
export type DeliveryStatus = 'NEW' | 'FULFILLMENT_PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'REVIEW_REQUIRED';
export type MessageSender = 'assistant' | 'customer' | 'system' | 'admin';

let schemaPromise: Promise<void> | null = null;
let postgresClient: Sql | null = null;

type QueryParameter = ParameterOrJSON<never>;
type QueryRow = Record<string, unknown>;
type QueryExecutor = Sql | TransactionSql;

export type QueryClient = {
  query<T extends QueryRow = QueryRow>(statement: string, parameters?: unknown[]): Promise<T[]>;
};

export type DatabaseClient = QueryClient & {
  transaction(callback: (transaction: QueryClient) => Promise<unknown>[]): Promise<unknown[]>;
};

function queryClient(executor: QueryExecutor): QueryClient {
  return {
    async query<T extends QueryRow = QueryRow>(statement: string, parameters: unknown[] = []) {
      const normalizedParameters = parameters.map((parameter) => (
        parameter === undefined ? null : parameter
      )) as QueryParameter[];
      const rows = await executor.unsafe<T[]>(statement, normalizedParameters, { prepare: false });
      return Array.from(rows);
    },
  };
}

export function database(): DatabaseClient {
  if (!postgresClient) {
    postgresClient = postgres(requireEnv('DATABASE_URL'), {
      ssl: 'require',
      prepare: false,
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }

  const client = queryClient(postgresClient);
  return {
    ...client,
    transaction: (callback) => postgresClient!.begin(async (transaction) => (
      Promise.all(callback(queryClient(transaction)))
    )),
  };
}

export async function ensureSchema() {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    const sql = database();
    const schemaState = await sql.query<{ ready: boolean }>(`SELECT
      to_regclass('public.orders') IS NOT NULL
      AND to_regclass('public.messages') IS NOT NULL
      AND to_regclass('public.audit_logs') IS NOT NULL
      AND to_regclass('public.webhook_events') IS NOT NULL
      AND to_regclass('public.admin_settings') IS NOT NULL AS ready`);
    if (schemaState[0]?.ready) return;

    await sql.query(`CREATE TABLE IF NOT EXISTS orders (
      id text PRIMARY KEY,
      conversation_id text NOT NULL UNIQUE,
      customer_name text NOT NULL,
      customer_email text NOT NULL,
      customer_phone text,
      amount_cents integer NOT NULL DEFAULT 6790 CHECK (amount_cents >= 0),
      payment_status text NOT NULL DEFAULT 'WAITING_PAYMENT',
      fulfillment_status text NOT NULL DEFAULT 'NEW',
      payment_provider text NOT NULL DEFAULT 'cakto',
      provider_order_id text UNIQUE,
      payment_method text,
      delivery_url text,
      assigned_to text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      paid_at timestamptz,
      delivered_at timestamptz
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS messages (
      id text PRIMARY KEY,
      order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      sender text NOT NULL,
      content text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS audit_logs (
      id text PRIMARY KEY,
      order_id text REFERENCES orders(id) ON DELETE SET NULL,
      action text NOT NULL,
      actor text NOT NULL,
      details jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS webhook_events (
      id text PRIMARY KEY,
      provider_order_id text,
      order_id text REFERENCES orders(id) ON DELETE SET NULL,
      event_name text NOT NULL,
      payload jsonb NOT NULL,
      processed_at timestamptz NOT NULL DEFAULT now()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS admin_settings (
      key text PRIMARY KEY,
      value text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await sql.query(`CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (lower(customer_email))`);
    await sql.query(`CREATE INDEX IF NOT EXISTS messages_order_created_idx ON messages (order_id, created_at)`);
    await sql.query(`INSERT INTO admin_settings (key, value) VALUES ('operation_mode', 'ONLINE') ON CONFLICT (key) DO NOTHING`);
  })().catch((error) => {
    schemaPromise = null;
    throw error;
  });
  return schemaPromise;
}

export function publicOrderId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const segment = (start: number) => Array.from(bytes.slice(start, start + 4), (byte) => alphabet[byte % alphabet.length]).join('');
  return `AP-${segment(0)}-${segment(4)}`;
}

export function recordId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

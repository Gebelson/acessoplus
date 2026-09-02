import 'server-only';

export function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Configuração ausente: ${name}`);
  return value;
}

export function getRuntimeStatus() {
  return {
    database: Boolean(process.env.DATABASE_URL?.trim()),
    adminAuth: Boolean(
      (process.env.ADMIN_ACCOUNTS?.trim()
        || (process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD?.trim()))
      && process.env.ADMIN_SESSION_SECRET?.trim()
    ),
    caktoWebhook: Boolean(process.env.CAKTO_WEBHOOK_SECRET?.trim()),
  };
}

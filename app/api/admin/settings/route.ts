import { getAdminSession } from '@/lib/admin-auth';
import { database, ensureSchema, recordId } from '@/lib/database';

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  const body = await request.json().catch(() => null) as { operationMode?: string } | null;
  if (!body?.operationMode || !['ONLINE', 'QUEUE', 'PAUSED'].includes(body.operationMode)) {
    return Response.json({ error: 'Modo de atendimento inválido.' }, { status: 400 });
  }
  try {
    await ensureSchema();
    const sql = database();
    await sql.transaction((tx) => [
      tx.query(`INSERT INTO admin_settings (key, value, updated_at) VALUES ('operation_mode', $1, now()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [body.operationMode]),
      tx.query(`INSERT INTO audit_logs (id, action, actor, details) VALUES ($1, 'OPERATION_MODE_CHANGED', $2, $3::jsonb)`, [recordId('audit'), session.email, JSON.stringify({ mode: body.operationMode })]),
    ]);
    return Response.json({ operationMode: body.operationMode });
  } catch (error) {
    console.error('admin settings error', error);
    return Response.json({ error: 'Não foi possível salvar o modo de atendimento.' }, { status: 500 });
  }
}

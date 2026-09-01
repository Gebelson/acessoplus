import { createAdminSession, credentialsAreValid } from '@/lib/admin-auth';
import { getRuntimeStatus } from '@/lib/config';

export async function POST(request: Request) {
  const status = getRuntimeStatus();
  if (!status.adminAuth) {
    return Response.json({ error: 'A autenticação administrativa ainda não foi configurada no servidor.' }, { status: 503 });
  }
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  if (!body?.email || !body.password || !(await credentialsAreValid(body.email, body.password))) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return Response.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 });
  }
  await createAdminSession();
  return Response.json({ ok: true });
}

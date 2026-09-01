import { getAdminSession } from '@/lib/admin-auth';
import { getAdminSnapshot } from '@/lib/admin-data';
import { getRuntimeStatus } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await getAdminSession())) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  const runtime = getRuntimeStatus();
  if (!runtime.database) return Response.json({ error: 'Banco de dados não configurado.', runtime }, { status: 503 });
  try {
    const search = new URL(request.url).searchParams.get('search') ?? '';
    return Response.json({ ...(await getAdminSnapshot(search)), runtime });
  } catch (error) {
    console.error('admin dashboard error', error);
    return Response.json({ error: 'Não foi possível carregar os dados operacionais.' }, { status: 500 });
  }
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminLogin } from '../../components/AdminLogin';
import { getAdminSession } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Entrar no painel | Acesso+',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect('/admin');
  return <AdminLogin />;
}

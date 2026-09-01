'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, LockKeyhole } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Não foi possível entrar.');
      router.replace('/admin');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível entrar.');
      setLoading(false);
    }
  };

  return <main className="grid min-h-screen place-items-center bg-[#f4f6fa] p-5 text-[#192444]">
    <div className="w-full max-w-[430px] rounded-[28px] border border-[#dfe4ec] bg-white p-7 shadow-[0_24px_70px_rgba(25,36,68,.1)] sm:p-9">
      <div className="flex items-center justify-between"><Image src="/logo-acesso.svg" alt="Acesso+" width={748} height={109} className="h-auto w-[130px]" /><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eeecff] text-[#6557d8]"><LockKeyhole size={20} /></span></div>
      <h1 className="mt-10 text-3xl font-extrabold tracking-[-.05em]">Painel administrativo</h1>
      <p className="mt-2 text-sm leading-6 text-[#727c92]">Entre com as credenciais configuradas para a operação Acesso+.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-xs font-extrabold text-[#59657d]">E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" className="mt-2 h-12 w-full rounded-xl border border-[#dce2eb] px-4 text-sm font-medium outline-none focus:border-[#6557d8] focus:ring-4 focus:ring-[#6557d8]/10" /></label>
        <label className="block text-xs font-extrabold text-[#59657d]">Senha<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-2 h-12 w-full rounded-xl border border-[#dce2eb] px-4 text-sm font-medium outline-none focus:border-[#6557d8] focus:ring-4 focus:ring-[#6557d8]/10" /></label>
        {error && <p className="rounded-xl border border-[#ffcbd1] bg-[#fff0f2] p-3 text-xs font-bold leading-5 text-[#9c3d4b]">{error}</p>}
        <button disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#192444] text-sm font-extrabold text-white disabled:opacity-60">{loading && <LoaderCircle className="animate-spin" size={17} />} Entrar</button>
      </form>
      <Link href="/" className="mt-7 flex items-center justify-center gap-2 text-xs font-bold text-[#727c92]"><ArrowLeft size={14} /> Voltar para o site</Link>
    </div>
  </main>;
}

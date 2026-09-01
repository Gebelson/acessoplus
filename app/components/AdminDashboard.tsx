'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity, ArrowLeft, Check, CircleDollarSign, Clock3, FileClock, LayoutDashboard,
  LogOut, Menu, PackageCheck, RefreshCw, Search, Send, Settings, ShoppingBag,
  UserCheck, X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type View = 'Visão geral' | 'Pedidos' | 'Atividades' | 'Configurações';
type OperationMode = 'ONLINE' | 'QUEUE' | 'PAUSED';
type Order = {
  id: string; conversation_id: string; customer_name: string; customer_email: string;
  customer_phone?: string | null; amount_cents: number; payment_status: string;
  fulfillment_status: string; payment_method?: string | null; provider_order_id?: string | null;
  delivery_url?: string | null; assigned_to?: string | null; created_at: string;
  paid_at?: string | null; delivered_at?: string | null;
};
type Message = { id: string; sender: string; content: string; created_at: string };
type ActivityItem = { id: string; order_id?: string | null; action: string; actor: string; details: Record<string, unknown>; created_at: string };
type DashboardData = {
  orders: Order[];
  metrics: { sales_today: number; revenue_today: number; awaiting_delivery: number; average_delivery_minutes: number; total_orders: number; review_required: number };
  chart: { day: string; revenue_cents: number }[];
  operationMode: OperationMode;
  activity: ActivityItem[];
  runtime: { database: boolean; adminAuth: boolean; caktoWebhook: boolean };
};

const nav: [typeof LayoutDashboard, View][] = [
  [LayoutDashboard, 'Visão geral'], [ShoppingBag, 'Pedidos'],
  [FileClock, 'Atividades'], [Settings, 'Configurações'],
];
const paymentLabels: Record<string, string> = {
  WAITING_PAYMENT: 'Aguardando pagamento', PAYMENT_CONFIRMED: 'Pagamento confirmado',
  PAYMENT_FAILED: 'Pagamento recusado', PAYMENT_REFUNDED: 'Pagamento estornado',
};
const deliveryLabels: Record<string, string> = {
  NEW: 'Pedido criado', FULFILLMENT_PENDING: 'Aguardando entrega', IN_PROGRESS: 'Ativação em andamento',
  DELIVERED: 'Acesso entregue', REVIEW_REQUIRED: 'Revisão necessária',
};
const activityLabels: Record<string, string> = {
  ORDER_CREATED: 'Pedido criado', ORDER_ASSIGNED: 'Atendimento assumido', MESSAGE_SENT: 'Mensagem enviada',
  ACCESS_DELIVERED: 'Acesso entregue', STATUS_CHANGED: 'Status atualizado',
  OPERATION_MODE_CHANGED: 'Modo de atendimento alterado',
};

function money(cents = 0) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
function dateTime(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
function statusTone(order: Order) {
  if (order.fulfillment_status === 'DELIVERED') return 'mint';
  if (order.fulfillment_status === 'REVIEW_REQUIRED' || ['PAYMENT_FAILED', 'PAYMENT_REFUNDED'].includes(order.payment_status)) return 'red';
  if (order.payment_status === 'PAYMENT_CONFIRMED') return 'amber';
  return 'gray';
}
function orderStatus(order: Order) {
  if (order.fulfillment_status !== 'NEW') return deliveryLabels[order.fulfillment_status] ?? order.fulfillment_status;
  return paymentLabels[order.payment_status] ?? order.payment_status;
}

export function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const [sidebar, setSidebar] = useState(false);
  const [activeView, setActiveView] = useState<View>('Visão geral');
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const searchRef = useRef('');

  const load = useCallback(async (query = '') => {
    try {
      const response = await fetch(`/api/admin/dashboard?search=${encodeURIComponent(query)}`, { cache: 'no-store' });
      const payload = await response.json() as DashboardData & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Falha ao carregar o painel.');
      setData(payload); setError('');
      setSelectedOrderId((current) => current || payload.orders[0]?.id || '');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao carregar o painel.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(searchRef.current), 15_000);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); };
  }, [load]);
  useEffect(() => {
    searchRef.current = search;
    const timer = window.setTimeout(() => void load(search), 280);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  const selectedOrder = data?.orders.find((order) => order.id === selectedOrderId) ?? data?.orders[0] ?? null;
  const loadMessages = useCallback(async (orderId: string) => {
    if (!orderId) return;
    const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, { cache: 'no-store' });
    const payload = await response.json() as { messages?: Message[]; error?: string };
    if (response.ok) setMessages(payload.messages ?? []);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadMessages(selectedOrderId), 0);
    return () => window.clearTimeout(timer);
  }, [loadMessages, selectedOrderId]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDeliveryUrl(selectedOrder?.delivery_url ?? ''), 0);
    return () => window.clearTimeout(timer);
  }, [selectedOrder?.delivery_url]);

  const mutateOrder = async (body: Record<string, unknown>) => {
    if (!selectedOrder) return false;
    setSaving(true); setError('');
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(selectedOrder.id)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const payload = await response.json() as { messages?: Message[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'A ação não pôde ser concluída.');
      setMessages(payload.messages ?? []); await load(search); return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'A ação não pôde ser concluída.'); return false;
    } finally { setSaving(false); }
  };
  const submitMessage = async (event: FormEvent) => {
    event.preventDefault(); const content = message.trim(); if (!content) return;
    if (await mutateOrder({ action: 'message', content })) setMessage('');
  };
  const setMode = async (operationMode: OperationMode) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ operationMode }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Não foi possível salvar.');
      setData((current) => current ? { ...current, operationMode } : current); setError('');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };
  const logout = async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.replace('/admin/login'); router.refresh(); };
  const chartMax = useMemo(() => Math.max(1, ...(data?.chart.map((item) => Number(item.revenue_cents)) ?? [1])), [data?.chart]);
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <main className="min-h-screen bg-[#f4f6fa] text-[#192444]">
      <div className="flex min-h-screen">
        <aside className={`admin-sidebar ${sidebar ? 'open' : ''}`}>
          <div className="flex h-[72px] items-center justify-between px-5">
            <Image src="/logo-acesso.svg" alt="Acesso+" width={748} height={109} className="h-auto w-[126px]" />
            <button className="lg:hidden" onClick={() => setSidebar(false)} aria-label="Fechar menu"><X size={20} /></button>
          </div>
          <nav className="px-3 py-3" aria-label="Navegação administrativa">
            {nav.map(([Icon, label]) => <button key={label} onClick={() => { setActiveView(label); setSidebar(false); }} className={`admin-nav-item ${activeView === label ? 'active' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'Pedidos' && Boolean(data?.metrics.awaiting_delivery) && <span className="ml-auto rounded-full bg-[#fff0c1] px-2 py-0.5 text-[10px] text-[#8a6515]">{data?.metrics.awaiting_delivery}</span>}</button>)}
          </nav>
          <div className="mt-auto space-y-2 p-4">
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl border border-[#e1e5ed] bg-white px-3 py-3 text-xs font-bold text-[#59657d]"><LogOut size={15} /> Sair do painel</button>
            <Link href="/" className="flex items-center gap-2 rounded-xl border border-[#e1e5ed] bg-white px-3 py-3 text-xs font-bold text-[#59657d]"><ArrowLeft size={15} /> Voltar para o site</Link>
          </div>
        </aside>
        {sidebar && <button className="fixed inset-0 z-40 bg-[#10182d]/35 lg:hidden" onClick={() => setSidebar(false)} aria-label="Fechar menu" />}
        <div className="min-w-0 flex-1 lg:ml-[244px]">
          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e1e5ed] bg-white/90 px-4 backdrop-blur-xl sm:px-7">
            <div className="flex items-center gap-3"><button className="icon-button grid !h-10 !w-10 lg:hidden" onClick={() => setSidebar(true)} aria-label="Abrir menu"><Menu size={19} /></button><div><p className="text-lg font-extrabold tracking-[-.03em]">{activeView}</p><p className="hidden text-xs text-[#7a8499] sm:block">Dados operacionais atualizados automaticamente</p></div></div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a93a6]" size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-[230px] rounded-xl border border-[#dde2eb] bg-[#f7f8fb] pl-9 pr-3 text-xs outline-none focus:border-[#6658d8]" placeholder="Pedido, nome ou e-mail" /></div>
              <button onClick={() => void load(search)} className="icon-button grid !h-10 !w-10" aria-label="Atualizar dados"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#192444] text-xs font-extrabold text-white">{adminEmail.slice(0, 2).toUpperCase()}</div>
            </div>
          </header>
          <div className="p-4 sm:p-7">
            {error && <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#ffcbd1] bg-[#fff0f2] p-4 text-sm font-bold text-[#9c3d4b]"><span>{error}</span><button onClick={() => void load(search)} className="rounded-lg bg-white px-3 py-2 text-xs">Tentar novamente</button></div>}
            {loading && !data && <div className="grid min-h-[520px] place-items-center"><RefreshCw className="animate-spin text-[#6557d8]" /></div>}
            {data && activeView === 'Visão geral' && <Overview data={data} chartMax={chartMax} labels={labels} saving={saving} setMode={setMode} openOrder={(id) => { setSelectedOrderId(id); setActiveView('Pedidos'); }} />}
            {data && activeView === 'Pedidos' && <OrdersWorkspace data={data} selectedOrder={selectedOrder} selectedOrderId={selectedOrderId} setSelectedOrderId={setSelectedOrderId} search={search} setSearch={setSearch} messages={messages} message={message} setMessage={setMessage} deliveryUrl={deliveryUrl} setDeliveryUrl={setDeliveryUrl} saving={saving} submitMessage={submitMessage} mutateOrder={mutateOrder} adminEmail={adminEmail} />}
            {data && activeView === 'Atividades' && <ActivityView activity={data.activity} />}
            {data && activeView === 'Configurações' && <SettingsView data={data} adminEmail={adminEmail} logout={logout} />}
          </div>
        </div>
      </div>
    </main>
  );
}

function Overview({ data, chartMax, labels, saving, setMode, openOrder }: { data: DashboardData; chartMax: number; labels: string[]; saving: boolean; setMode: (mode: OperationMode) => Promise<void>; openOrder: (id: string) => void }) {
  return <>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      ['Vendas hoje', String(data.metrics.sales_today), 'pagamentos aprovados', ShoppingBag, 'violet'],
      ['Receita hoje', money(data.metrics.revenue_today), 'valor confirmado', CircleDollarSign, 'mint'],
      ['Aguardando entrega', String(data.metrics.awaiting_delivery), 'ação necessária', Clock3, 'amber'],
      ['Tempo médio de entrega', `${data.metrics.average_delivery_minutes} min`, `${data.metrics.total_orders} pedidos no total`, Activity, 'blue'],
    ].map(([label, value, hint, Icon, tone]) => <article key={String(label)} className="metric-card"><div className={`metric-icon ${String(tone)}`}><Icon size={19} /></div><p className="mt-6 text-xs font-bold text-[#7b859a]">{String(label)}</p><div className="mt-2 flex items-end justify-between gap-3"><strong className="text-2xl tracking-[-.045em]">{String(value)}</strong><span className="text-right text-[10px] font-bold text-[#66718a]">{String(hint)}</span></div></article>)}</section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
      <div className="rounded-[22px] border border-[#dfe4ec] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-extrabold tracking-[-.025em]">Receita confirmada nos últimos 7 dias</h2><p className="mt-1 text-xs text-[#838ca0]">Somente pagamentos aprovados pela Cakto</p></div><span className="rounded-xl bg-[#f3f5f9] px-3 py-2 text-xs font-bold text-[#66718a]">7 dias</span></div><div className="chart-area mt-7"><div className="chart-grid" /><div className="chart-bars">{data.chart.map((item) => <div key={item.day} className="flex flex-1 flex-col justify-end" title={`${item.day}: ${money(item.revenue_cents)}`}><div className="min-h-[2px] rounded-t-lg bg-[#6557d8]" style={{ height: `${Math.max(1, (Number(item.revenue_cents) / chartMax) * 100)}%` }} /></div>)}</div></div><div className="mt-3 flex justify-between text-[10px] font-semibold text-[#9098aa]">{data.chart.map((item) => <span key={item.day}>{labels[new Date(`${item.day}T12:00:00`).getDay()]}</span>)}</div></div>
      <div className="rounded-[22px] border border-[#dfe4ec] bg-white p-5 sm:p-6"><h2 className="font-extrabold tracking-[-.025em]">Modo de atendimento</h2><p className="mt-1 text-xs text-[#838ca0]">Alterações ficam registradas no histórico</p><div className="mt-6 space-y-2">{([['ONLINE', 'Online'], ['QUEUE', 'Fila'], ['PAUSED', 'Pausado']] as const).map(([value, label]) => <button disabled={saving} key={value} onClick={() => void setMode(value)} className={`mode-button ${data.operationMode === value ? 'selected' : ''}`}><span className={`h-2.5 w-2.5 rounded-full ${value === 'ONLINE' ? 'bg-[#00bea5]' : value === 'QUEUE' ? 'bg-[#e4a72f]' : 'bg-[#df5c6b]'}`} /><span>{label}</span>{data.operationMode === value && <Check className="ml-auto" size={15} />}</button>)}</div><div className="mt-5 rounded-xl bg-[#f6f7fa] p-3 text-[11px] leading-5 text-[#727c92]">{data.metrics.review_required ? `${data.metrics.review_required} pedido(s) precisam de revisão.` : 'Nenhum pedido precisa de revisão neste momento.'}</div></div>
    </section>
    <OrdersTable orders={data.orders.slice(0, 8)} onOpen={openOrder} />
  </>;
}

type WorkspaceProps = { data: DashboardData; selectedOrder: Order | null; selectedOrderId: string; setSelectedOrderId: (id: string) => void; search: string; setSearch: (value: string) => void; messages: Message[]; message: string; setMessage: (value: string) => void; deliveryUrl: string; setDeliveryUrl: (value: string) => void; saving: boolean; submitMessage: (event: FormEvent) => Promise<void>; mutateOrder: (body: Record<string, unknown>) => Promise<boolean>; adminEmail: string };
function OrdersWorkspace(props: WorkspaceProps) {
  const { data, selectedOrder, selectedOrderId, setSelectedOrderId, search, setSearch, messages, message, setMessage, deliveryUrl, setDeliveryUrl, saving, submitMessage, mutateOrder, adminEmail } = props;
  return <section className="order-workspace">
    <div className="order-list-panel"><div className="border-b border-[#e4e8ef] p-4"><h2 className="font-extrabold">Pedidos</h2><p className="mt-1 text-xs text-[#858ea2]">{data.orders.length} pedido(s) encontrado(s)</p><div className="relative mt-3 sm:hidden"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a93a6]" size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-full rounded-xl border border-[#dde2eb] pl-9 pr-3 text-xs" placeholder="Buscar" /></div></div>{data.orders.map((order) => <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`order-list-item ${selectedOrderId === order.id ? 'selected' : ''}`}><div className="flex items-center justify-between"><strong className="text-xs">{order.id}</strong><span className="text-[10px] text-[#8992a5]">{dateTime(order.created_at)}</span></div><p className="mt-2 text-sm font-bold">{order.customer_name}</p><span className={`status-pill mt-2 ${statusTone(order)}`}>{orderStatus(order)}</span></button>)}</div>
    {selectedOrder ? <>
      <div className="order-chat-panel"><div className="flex items-center justify-between border-b border-[#e4e8ef] p-4"><div><p className="font-extrabold">{selectedOrder.customer_name}</p><p className="text-[10px] text-[#7d879c]">Pedido {selectedOrder.id}</p></div><button disabled={saving || selectedOrder.assigned_to === adminEmail} onClick={() => void mutateOrder({ action: 'assign' })} className="rounded-xl border border-[#dce2eb] px-3 py-2 text-[10px] font-extrabold disabled:opacity-50"><UserCheck className="mr-1 inline" size={13} />{selectedOrder.assigned_to ? 'ATENDIMENTO ASSUMIDO' : 'ASSUMIR ATENDIMENTO'}</button></div><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.length ? messages.map((item) => <div key={item.id} className={item.sender === 'customer' ? 'flex justify-end' : item.sender === 'system' ? 'flex justify-center' : 'flex justify-start'}>{item.sender === 'system' ? <div className="system-message mx-auto">{item.content}</div> : <div className={`chat-bubble ${item.sender === 'customer' ? 'customer-bubble' : 'assistant-bubble'}`}>{item.sender === 'admin' && <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-wider text-[#6557d8]">Equipe Acesso+</span>}{item.content}</div>}</div>) : <p className="py-10 text-center text-xs text-[#8b93a5]">Nenhuma mensagem registrada.</p>}</div><form onSubmit={submitMessage} className="border-t border-[#e4e8ef] p-3"><div className="flex items-center gap-2 rounded-xl border border-[#dce2eb] bg-[#f7f8fb] p-2"><input value={message} onChange={(event) => setMessage(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" placeholder="Digite uma resposta..." /><button disabled={saving || !message.trim()} className="grid h-9 w-9 place-items-center rounded-lg bg-[#192444] text-white disabled:opacity-40"><Send size={15} /></button></div></form></div>
      <div className="order-detail-panel"><div className="border-b border-[#e4e8ef] p-4"><h2 className="font-extrabold">Detalhes</h2><p className="mt-1 text-xs text-[#858ea2]">Pedido e entrega</p></div><div className="space-y-5 p-4"><div className="rounded-xl bg-[#f6f7fa] p-3 text-xs"><Detail label="Cliente" value={selectedOrder.customer_name} /><Detail label="E-mail" value={selectedOrder.customer_email} /><Detail label="Contato" value={selectedOrder.customer_phone || 'Não informado'} /><Detail label="Valor" value={money(selectedOrder.amount_cents)} /><Detail label="Pagamento" value={paymentLabels[selectedOrder.payment_status] ?? selectedOrder.payment_status} /><Detail label="Entrega" value={deliveryLabels[selectedOrder.fulfillment_status] ?? selectedOrder.fulfillment_status} /><Detail label="Método" value={selectedOrder.payment_method || 'Ainda não informado'} /><Detail label="ID Cakto" value={selectedOrder.provider_order_id || 'Aguardando evento'} /></div><div><label htmlFor="delivery-url" className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#68738d]">Link de acesso</label><input id="delivery-url" value={deliveryUrl} onChange={(event) => setDeliveryUrl(event.target.value)} disabled={selectedOrder.fulfillment_status === 'DELIVERED'} className="mt-2 h-11 w-full rounded-xl border border-[#dce2eb] px-3 text-xs outline-none focus:border-[#6557d8] disabled:bg-[#edf0f4]" placeholder="https://..." /><button disabled={saving || selectedOrder.payment_status !== 'PAYMENT_CONFIRMED' || selectedOrder.fulfillment_status === 'DELIVERED'} onClick={() => void mutateOrder({ action: 'deliver', deliveryUrl })} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#192444] text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-45"><PackageCheck size={14} /> Registrar e enviar acesso</button></div><div className="grid grid-cols-2 gap-2"><button disabled={saving || selectedOrder.fulfillment_status === 'DELIVERED'} onClick={() => void mutateOrder({ action: 'status', fulfillmentStatus: 'IN_PROGRESS' })} className="rounded-xl border border-[#dce2eb] px-3 py-3 text-[10px] font-extrabold">EM ANDAMENTO</button><button disabled={saving || selectedOrder.fulfillment_status === 'DELIVERED'} onClick={() => void mutateOrder({ action: 'status', fulfillmentStatus: 'REVIEW_REQUIRED' })} className="rounded-xl border border-[#f1ccd1] px-3 py-3 text-[10px] font-extrabold text-[#a74754]">PEDIR REVISÃO</button></div></div></div>
    </> : <div className="col-span-2 grid place-items-center p-8 text-sm text-[#858ea2]">Selecione um pedido.</div>}
  </section>;
}

function ActivityView({ activity }: { activity: ActivityItem[] }) {
  return <section className="overflow-hidden rounded-[22px] border border-[#dfe4ec] bg-white"><div className="border-b border-[#e5e9f0] p-5"><h2 className="font-extrabold">Histórico de atividades</h2><p className="mt-1 text-xs text-[#838ca0]">Ações administrativas e eventos do sistema</p></div><div className="divide-y divide-[#edf0f4]">{activity.length ? activity.map((item) => <div key={item.id} className="flex items-start gap-4 p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eeecff] text-[#6557d8]"><FileClock size={16} /></span><div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{activityLabels[item.action] ?? item.action}</p><p className="mt-1 text-xs text-[#7b859a]">{item.actor}{item.order_id ? ` · Pedido ${item.order_id}` : ''}</p></div><time className="text-[10px] text-[#8b93a5]">{dateTime(item.created_at)}</time></div>) : <p className="p-8 text-center text-sm text-[#858ea2]">Nenhuma atividade registrada.</p>}</div></section>;
}
function SettingsView({ data, adminEmail, logout }: { data: DashboardData; adminEmail: string; logout: () => Promise<void> }) {
  return <section className="grid gap-5 lg:grid-cols-2"><div className="rounded-[22px] border border-[#dfe4ec] bg-white p-6"><h2 className="font-extrabold">Integrações de produção</h2><p className="mt-2 text-sm leading-6 text-[#727c92]">O painel informa somente configurações realmente disponíveis no servidor.</p><div className="mt-6 space-y-3"><RuntimeRow label="Banco PostgreSQL" active={data.runtime.database} /><RuntimeRow label="Autenticação administrativa" active={data.runtime.adminAuth} /><RuntimeRow label="Webhook da Cakto" active={data.runtime.caktoWebhook} /></div></div><div className="rounded-[22px] border border-[#dfe4ec] bg-white p-6"><h2 className="font-extrabold">Conta administrativa</h2><p className="mt-3 text-sm font-bold">{adminEmail}</p><p className="mt-2 text-xs leading-5 text-[#7b859a]">Sessão protegida por cookie HTTP-only, com expiração automática após 12 horas.</p><button onClick={() => void logout()} className="mt-6 flex items-center gap-2 rounded-xl bg-[#192444] px-4 py-3 text-xs font-extrabold text-white"><LogOut size={14} /> Encerrar sessão</button></div></section>;
}
function OrdersTable({ orders, onOpen }: { orders: Order[]; onOpen: (id: string) => void }) {
  return <section className="mt-5 rounded-[22px] border border-[#dfe4ec] bg-white"><div className="border-b border-[#e5e9f0] px-5 py-5 sm:px-6"><h2 className="font-extrabold tracking-[-.025em]">Pedidos recentes</h2><p className="mt-1 text-xs text-[#838ca0]">Pagamentos e entregas reais</p></div><div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Valor</th><th>Criado em</th><th>Status</th></tr></thead><tbody>{orders.length ? orders.map((order) => <tr key={order.id} onClick={() => onOpen(order.id)}><td className="font-extrabold">{order.id}</td><td><p className="font-bold text-[#35415b]">{order.customer_name}</p><p className="mt-1 text-[10px] text-[#8b93a5]">{order.customer_email}</p></td><td>{money(order.amount_cents)}</td><td>{dateTime(order.created_at)}</td><td><span className={`status-pill ${statusTone(order)}`}>{orderStatus(order)}</span></td></tr>) : <tr><td colSpan={5} className="!py-10 text-center">Nenhum pedido registrado.</td></tr>}</tbody></table></div></section>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return <div className="mt-3 first:mt-0"><span className="block text-[9px] font-bold uppercase tracking-wider text-[#8b93a5]">{label}</span><strong className="mt-1 block break-all text-[#35415b]">{value}</strong></div>;
}
function RuntimeRow({ label, active }: { label: string; active: boolean }) {
  return <div className="flex items-center justify-between rounded-xl bg-[#f6f7fa] p-4 text-sm font-bold"><span>{label}</span><span className={`status-pill ${active ? 'mint' : 'red'}`}>{active ? 'Conectado' : 'Não configurado'}</span></div>;
}

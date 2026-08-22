'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PackageCheck,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { useState } from 'react';

type OperationMode = 'ONLINE' | 'FILA' | 'PAUSADO';

const orders = [
  { id: 'AP-7K2M-XP4A', name: 'Marina Lima', email: 'marina@email.com', value: 'R$ 149,90', time: '12:48', status: 'Aguardando entrega', tone: 'amber' },
  { id: 'AP-4Q8N-CL7R', name: 'Rafael Souza', email: 'rafael@email.com', value: 'R$ 149,90', time: '12:21', status: 'Entregue', tone: 'mint' },
  { id: 'AP-3A1K-ZV6E', name: 'Ana Paula', email: 'ana@email.com', value: 'R$ 149,90', time: '11:54', status: 'Aguardando pagamento', tone: 'gray' },
  { id: 'AP-9J5T-HB2D', name: 'Diego Alves', email: 'diego@email.com', value: 'R$ 149,90', time: '11:32', status: 'Revisão necessária', tone: 'red' },
];

const nav = [
  [LayoutDashboard, 'Visão geral'],
  [ShoppingBag, 'Pedidos'],
  [MessageSquareText, 'Conversas'],
  [PackageCheck, 'Entregas'],
  [Users, 'Clientes'],
  [WalletCards, 'Pagamentos'],
  [Bot, 'Automações'],
  [TrendingUp, 'Tráfego orgânico'],
  [FileText, 'Conteúdo'],
  [CalendarDays, 'Campanhas'],
  [Activity, 'Analytics'],
  [Settings, 'Configurações'],
];

export function AdminDashboard() {
  const [sidebar, setSidebar] = useState(false);
  const [mode, setMode] = useState<OperationMode>('ONLINE');
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [delivered, setDelivered] = useState(false);
  const [activeView, setActiveView] = useState('Visão geral');

  const deliver = () => {
    try {
      const url = new URL(deliveryUrl);
      if (!['http:', 'https:'].includes(url.protocol)) return;
      setDelivered(true);
    } catch { setDelivered(false); }
  };

  return (
    <main className="min-h-screen bg-[#f4f6fa] text-[#192444]">
      <div className="border-b border-[#e1e5ed] bg-[#fff9e9] px-4 py-2 text-center text-[11px] font-bold text-[#745f2d]">Painel demonstrativo — nenhum dado, pagamento ou entrega desta tela é real.</div>
      <div className="flex min-h-[calc(100vh-33px)]">
        <aside className={`admin-sidebar ${sidebar ? 'open' : ''}`}>
          <div className="flex h-[72px] items-center justify-between px-5">
            <Image src="/logo-acesso.svg" alt="Acesso+" width={748} height={109} className="h-auto w-[126px]" />
            <button className="lg:hidden" onClick={() => setSidebar(false)} aria-label="Fechar menu"><X size={20} /></button>
          </div>
          <nav className="px-3 py-3" aria-label="Navegação administrativa">
            {nav.map(([Icon, label]) => {
              const NavIcon = Icon as typeof LayoutDashboard;
              const active = activeView === label;
              return <button key={String(label)} onClick={() => { setActiveView(String(label)); setSidebar(false); }} className={`admin-nav-item ${active ? 'active' : ''}`}><NavIcon size={18} /><span>{String(label)}</span>{label === 'Entregas' && <span className="ml-auto rounded-full bg-[#fff0c1] px-2 py-0.5 text-[10px] text-[#8a6515]">3</span>}</button>;
            })}
          </nav>
          <div className="mt-auto p-4">
            <Link href="/" className="flex items-center gap-2 rounded-xl border border-[#e1e5ed] bg-white px-3 py-3 text-xs font-bold text-[#59657d]"><ArrowLeft size={15} /> Voltar para o site</Link>
          </div>
        </aside>
        {sidebar && <button className="fixed inset-0 z-40 bg-[#10182d]/35 lg:hidden" onClick={() => setSidebar(false)} aria-label="Fechar menu" />}

        <div className="min-w-0 flex-1 lg:ml-[244px]">
          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e1e5ed] bg-white/90 px-4 backdrop-blur-xl sm:px-7">
            <div className="flex items-center gap-3"><button className="icon-button grid !h-10 !w-10 lg:hidden" onClick={() => setSidebar(true)} aria-label="Abrir menu"><Menu size={19} /></button><div><p className="text-lg font-extrabold tracking-[-.03em]">{activeView}</p><p className="hidden text-xs text-[#7a8499] sm:block">Operação Acesso+ em tempo real</p></div></div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a93a6]" size={15} /><input className="h-10 w-[210px] rounded-xl border border-[#dde2eb] bg-[#f7f8fb] pl-9 pr-3 text-xs outline-none focus:border-[#6658d8]" placeholder="Buscar pedido..." /></div>
              <button className="flex h-10 items-center gap-2 rounded-xl border border-[#dce2eb] bg-white px-3 text-xs font-extrabold"><span className={`h-2 w-2 rounded-full ${mode === 'ONLINE' ? 'bg-[#00bea5]' : mode === 'FILA' ? 'bg-[#e4a72f]' : 'bg-[#df5c6b]'}`} /> {mode}<ChevronDown size={14} /></button>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#192444] text-xs font-extrabold text-white">GA</div>
            </div>
          </header>

          <div className="p-4 sm:p-7">
            {activeView === 'Visão geral' ? (
              <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Vendas hoje', '12', '+18%', ShoppingBag, 'violet'],
                    ['Receita hoje', 'R$ 1.798,80', '+12%', CircleDollarSign, 'mint'],
                    ['Aguardando entrega', '3', 'ação necessária', Clock3, 'amber'],
                    ['Tempo médio', '18 min', '-4 min', Activity, 'blue'],
                  ].map(([label, value, change, Icon, tone]) => {
                    const CardIcon = Icon as typeof ShoppingBag;
                    return <article key={String(label)} className="metric-card"><div className={`metric-icon ${String(tone)}`}><CardIcon size={19} /></div><p className="mt-6 text-xs font-bold text-[#7b859a]">{String(label)}</p><div className="mt-2 flex items-end justify-between gap-3"><strong className="text-2xl tracking-[-.045em]">{String(value)}</strong><span className="text-[10px] font-bold text-[#4c9b8c]">{String(change)}</span></div></article>;
                  })}
                </section>

                <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
                  <div className="rounded-[22px] border border-[#dfe4ec] bg-white p-5 sm:p-6">
                    <div className="flex items-center justify-between"><div><h2 className="font-extrabold tracking-[-.025em]">Receita nos últimos 7 dias</h2><p className="mt-1 text-xs text-[#838ca0]">Dados ilustrativos do painel demo</p></div><span className="rounded-xl bg-[#f3f5f9] px-3 py-2 text-xs font-bold text-[#66718a]">7 dias</span></div>
                    <div className="chart-area mt-7" aria-label="Gráfico ilustrativo de receita"><div className="chart-grid" /><div className="chart-bars">{[44, 62, 54, 78, 68, 88, 72].map((height, index) => <div key={index} className="flex flex-1 flex-col justify-end"><div className="rounded-t-lg bg-[#6557d8]" style={{ height: `${height}%`, opacity: .48 + index * .07 }} /></div>)}</div></div>
                    <div className="mt-3 flex justify-between text-[10px] font-semibold text-[#9098aa]"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div>
                  </div>

                  <div className="rounded-[22px] border border-[#dfe4ec] bg-white p-5 sm:p-6">
                    <div className="flex items-center justify-between"><div><h2 className="font-extrabold tracking-[-.025em]">Modo de operação</h2><p className="mt-1 text-xs text-[#838ca0]">Próxima mudança: 01:00</p></div><Sparkles size={18} className="text-[#6557d8]" /></div>
                    <div className="mt-6 space-y-2">
                      {(['ONLINE', 'FILA', 'PAUSADO'] as OperationMode[]).map((item) => <button key={item} onClick={() => setMode(item)} className={`mode-button ${mode === item ? 'selected' : ''}`}><span className={`h-2.5 w-2.5 rounded-full ${item === 'ONLINE' ? 'bg-[#00bea5]' : item === 'FILA' ? 'bg-[#e4a72f]' : 'bg-[#df5c6b]'}`} /><span>{item}</span>{mode === item && <Check className="ml-auto" size={15} />}</button>)}
                    </div>
                    <p className="mt-5 rounded-xl bg-[#f6f7fa] p-3 text-[11px] leading-5 text-[#727c92]">Override manual ativo apenas nesta demonstração. Em produção, as mudanças ficam registradas na auditoria.</p>
                  </div>
                </section>

                <section className="mt-5 rounded-[22px] border border-[#dfe4ec] bg-white">
                  <div className="flex items-center justify-between border-b border-[#e5e9f0] px-5 py-5 sm:px-6"><div><h2 className="font-extrabold tracking-[-.025em]">Pedidos recentes</h2><p className="mt-1 text-xs text-[#838ca0]">Acompanhe pagamento e fulfillment</p></div><button onClick={() => setActiveView('Pedidos')} className="text-xs font-extrabold text-[#5d50cb]">Ver todos</button></div>
                  <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Valor</th><th>Horário</th><th>Status</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order.id} onClick={() => { setSelectedOrder(order); setActiveView('Pedidos'); }}><td className="font-extrabold">{order.id}</td><td><p className="font-bold text-[#35415b]">{order.name}</p><p className="mt-1 text-[10px] text-[#8b93a5]">{order.email}</p></td><td>{order.value}</td><td>{order.time}</td><td><span className={`status-pill ${order.tone}`}>{order.status}</span></td><td><ChevronDown className="-rotate-90" size={15} /></td></tr>)}</tbody></table></div>
                </section>
              </>
            ) : activeView === 'Pedidos' ? (
              <section className="order-workspace">
                <div className="order-list-panel"><div className="border-b border-[#e4e8ef] p-4"><h2 className="font-extrabold">Pedidos</h2><p className="mt-1 text-xs text-[#858ea2]">{orders.length} pedidos demonstrativos</p></div>{orders.map((order) => <button key={order.id} onClick={() => { setSelectedOrder(order); setDelivered(false); setDeliveryUrl(''); }} className={`order-list-item ${selectedOrder.id === order.id ? 'selected' : ''}`}><div className="flex items-center justify-between"><strong className="text-xs">{order.id}</strong><span className="text-[10px] text-[#8992a5]">{order.time}</span></div><p className="mt-2 text-sm font-bold">{order.name}</p><span className={`status-pill mt-2 ${order.tone}`}>{order.status}</span></button>)}</div>
                <div className="order-chat-panel"><div className="flex items-center justify-between border-b border-[#e4e8ef] p-4"><div><p className="font-extrabold">{selectedOrder.name}</p><p className="text-[10px] text-[#7d879c]">Pedido {selectedOrder.id}</p></div><button className="rounded-xl border border-[#dce2eb] px-3 py-2 text-[10px] font-extrabold">ASSUMIR CONVERSA</button></div><div className="flex-1 space-y-4 overflow-y-auto p-5"><div className="chat-bubble assistant-bubble">Olá! Seu pagamento foi confirmado e o pedido entrou em preparação.</div><div className="flex justify-end"><div className="chat-bubble customer-bubble">Perfeito, obrigado! Vou aguardar por aqui.</div></div><div className="system-message mx-auto">Pedido vinculado por order_id e conversation_id</div></div><div className="border-t border-[#e4e8ef] p-3"><div className="flex items-center gap-2 rounded-xl border border-[#dce2eb] bg-[#f7f8fb] p-2"><input className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" placeholder="Responder como operador..." /><button className="grid h-9 w-9 place-items-center rounded-lg bg-[#192444] text-white"><Send size={15} /></button></div></div></div>
                <div className="order-detail-panel"><div className="border-b border-[#e4e8ef] p-4"><h2 className="font-extrabold">Detalhes</h2><p className="mt-1 text-xs text-[#858ea2]">Fulfillment manual</p></div><div className="space-y-5 p-4"><div className="rounded-xl bg-[#f6f7fa] p-3 text-xs"><div className="flex justify-between"><span className="text-[#7c8599]">Produto</span><strong>Gemini PRO</strong></div><div className="mt-3 flex justify-between"><span className="text-[#7c8599]">Valor</span><strong>{selectedOrder.value}</strong></div><div className="mt-3 flex justify-between"><span className="text-[#7c8599]">Status</span><span className={`status-pill ${selectedOrder.tone}`}>{selectedOrder.status}</span></div></div><div><label htmlFor="delivery-url" className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#68738d]">Link de acesso</label><input id="delivery-url" value={deliveryUrl} onChange={(event) => { setDeliveryUrl(event.target.value); setDelivered(false); }} className="mt-2 h-11 w-full rounded-xl border border-[#dce2eb] px-3 text-xs outline-none focus:border-[#6557d8]" placeholder="https://..." /><button onClick={deliver} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#192444] text-xs font-extrabold text-white"><Send size={14} /> Enviar para o cliente</button>{delivered && <p className="mt-3 rounded-xl bg-[#e6f9f5] p-3 text-xs font-bold text-[#147362]">Link validado e entrega demo registrada.</p>}</div><div className="border-t border-[#e5e9f0] pt-4 text-[10px] leading-5 text-[#858da0]">A entrega em produção exige confirmação, impede duplicidade e gera log de auditoria com operador, horário, order_id e conversation_id.</div></div></div>
              </section>
            ) : (
              <section className="flex min-h-[520px] items-center justify-center rounded-[24px] border border-[#dfe4ec] bg-white p-8 text-center"><div className="max-w-[470px]"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eeebff] text-[#6557d8]"><Bot size={26} /></div><h2 className="mt-5 text-xl font-extrabold">{activeView}</h2><p className="mt-3 text-sm leading-7 text-[#727c92]">Esta área está preparada na navegação do MVP. Conecte o banco e as integrações reais para ativar dados persistentes e operações de produção.</p><button onClick={() => setActiveView('Visão geral')} className="mt-6 rounded-xl bg-[#192444] px-5 py-3 text-xs font-extrabold text-white">Voltar à visão geral</button></div></section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

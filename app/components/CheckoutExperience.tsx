'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Mail,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Sender = 'assistant' | 'customer' | 'system';
type Message = { id: string; sender: Sender; content: string; time?: string };
type Step = 'confirm' | 'name' | 'email' | 'phone' | 'payment' | 'preparing' | 'delivered';
type ServerOrder = {
  id: string;
  payment_status: string;
  fulfillment_status: string;
  delivery_url?: string | null;
};

const initialMessages: Message[] = [
  { id: 'welcome', sender: 'assistant', content: 'Olá! 👋 Eu sou a Cessi e vou acompanhar você durante a ativação dos seus 18 meses de Gemini Pro.' },
  { id: 'summary', sender: 'assistant', content: 'Antes de avançarmos, vou confirmar os detalhes do seu pedido. Está tudo correto?' },
];

function createToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID().replaceAll('-', '').slice(0, 18);
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function CheckoutExperience({ initialConversationId }: { initialConversationId: string }) {
  const [conversationId] = useState(() => initialConversationId === 'novo' ? createToken() : initialConversationId);
  const [orderId, setOrderId] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [step, setStep] = useState<Step>('confirm');
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serverOrder, setServerOrder] = useState<ServerOrder | null>(null);
  const [syncError, setSyncError] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const messageEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialConversationId !== 'novo') return;
    window.history.replaceState({}, '', `/checkout/${conversationId}`);
  }, [conversationId, initialConversationId]);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step]);

  useEffect(() => {
    if (!conversationId || conversationId === 'novo') return;
    const stored = localStorage.getItem(`acessoplus:${conversationId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored) as { messages: Message[]; step: Step; orderId: string; name: string; email: string; phone: string };
        const restore = window.setTimeout(() => {
          setMessages(data.messages);
          setStep(data.step);
          setOrderId(data.orderId);
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone);
        }, 0);
        return () => window.clearTimeout(restore);
      } catch { /* corrupted local draft is safely ignored */ }
    }
  }, [conversationId]);

  const syncOrder = useCallback(async () => {
    if (!conversationId || conversationId === 'novo') return false;
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(conversationId)}`, { cache: 'no-store' });
      if (response.status === 404) return false;
      const payload = await response.json() as { error?: string; order: ServerOrder; messages?: { id: string; sender: Sender; content: string }[] };
      if (!response.ok) throw new Error(payload.error ?? 'Não foi possível atualizar o pedido.');
      const order = payload.order as ServerOrder;
      setServerOrder(order);
      setOrderId(order.id);
      if (Array.isArray(payload.messages) && payload.messages.length) {
        setMessages(payload.messages.map((item: { id: string; sender: Sender; content: string }) => ({ id: item.id, sender: item.sender, content: item.content })));
      }
      if (order.fulfillment_status === 'DELIVERED') setStep('delivered');
      else if (order.payment_status === 'PAYMENT_CONFIRMED') setStep('preparing');
      else setStep('payment');
      setSyncError('');
      return true;
    } catch (caught) {
      setSyncError(caught instanceof Error ? caught.message : 'Não foi possível atualizar o pedido.');
      return false;
    }
  }, [conversationId]);

  useEffect(() => {
    const initial = window.setTimeout(() => void syncOrder(), 0);
    const interval = window.setInterval(() => void syncOrder(), 8_000);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); };
  }, [syncOrder]);

  useEffect(() => {
    if (!conversationId || conversationId === 'novo') return;
    localStorage.setItem(`acessoplus:${conversationId}`, JSON.stringify({ messages, step, orderId, name, email, phone }));
  }, [conversationId, email, messages, name, orderId, phone, step]);

  const addMessage = (sender: Sender, content: string) => {
    const next = { id: createToken(), sender, content };
    setMessages((current) => [...current, next]);
    if (sender === 'customer' && orderId) {
      void fetch(`/api/orders/${encodeURIComponent(conversationId)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: next.id, content }),
      }).then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({})) as { error?: string };
          setSyncError(payload.error ?? 'Sua mensagem não foi sincronizada.');
        }
      });
    }
    return next;
  };

  const continueOrder = () => {
    addMessage('customer', 'Sim, continuar');
    window.setTimeout(() => {
      addMessage('assistant', 'Perfeito! Para criar seu pedido, preciso de algumas informações. Qual é o seu nome?');
      setStep('name');
    }, 320);
  };

  const askQuestion = () => {
    addMessage('customer', 'Tenho uma dúvida');
    window.setTimeout(() => addMessage('assistant', 'Claro. Escreva sua dúvida abaixo. Se precisar, você também pode pedir atendimento humano.'), 300);
  };

  const submitText = (event: FormEvent) => {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;
    addMessage('customer', value);
    setInput('');

    if (step === 'name') {
      setName(value);
      window.setTimeout(() => { addMessage('assistant', `Prazer, ${value.split(' ')[0]}! Agora me diga seu melhor e-mail.`); setStep('email'); }, 300);
      return;
    }

    if (step === 'email') {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) { window.setTimeout(() => addMessage('assistant', 'Esse e-mail parece incompleto. Pode conferir e enviar novamente?'), 250); return; }
      setEmail(value);
      window.setTimeout(() => { addMessage('assistant', 'Se quiser, informe seu WhatsApp ou Telegram para receber atualizações. Você também pode pular esta etapa.'); setStep('phone'); }, 300);
      return;
    }

    if (step === 'phone') {
      setPhone(value);
      void createOrder(value);
      return;
    }

    window.setTimeout(() => addMessage('assistant', 'Recebi sua mensagem. Um atendente poderá continuar com você por aqui.'), 300);
  };

  const createOrder = async (optionalPhone = '') => {
    if (creatingOrder) return;
    if (optionalPhone) setPhone(optionalPhone);
    setCreatingOrder(true);
    setSyncError('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, name, email, phone: optionalPhone || phone, messages }),
      });
      const payload = await response.json() as { error?: string; orderId: string };
      if (!response.ok) throw new Error(payload.error ?? 'Não foi possível criar o pedido.');
      setOrderId(payload.orderId);
      setServerOrder({ id: payload.orderId, payment_status: 'WAITING_PAYMENT', fulfillment_status: 'NEW' });
      addMessage('system', `Pedido ${payload.orderId} criado com segurança.`);
      addMessage('assistant', 'Seu pedido foi criado com sucesso. Agora só falta concluir o pagamento.');
      setStep('payment');
    } catch (caught) {
      setSyncError(caught instanceof Error ? caught.message : 'Não foi possível criar o pedido.');
    } finally { setCreatingOrder(false); }
  };

  const openPaymentPage = () => {
    addMessage('customer', 'Ir para o pagamento');
    window.setTimeout(() => {
      addMessage('assistant', 'A página de pagamento da Cakto foi aberta em uma nova aba. Depois da confirmação, acompanhe sua ativação por aqui.');
    }, 250);
  };

  const placeholder = 'Digite sua resposta...';
  const timelineStep = step === 'confirm' || step === 'name' || step === 'email' || step === 'phone' ? 1 : step === 'payment' ? 2 : step === 'preparing' ? 4 : 5;
  const firstName = name.split(' ')[0] || 'Você';

  const timeline = useMemo(() => [
    ['Pedido criado', timelineStep >= 1],
    ['Aguardando pagamento', timelineStep >= 2],
    ['Pagamento confirmado', timelineStep >= 3],
    ['Ativação em andamento', timelineStep >= 4],
    ['Acesso entregue', timelineStep >= 5],
  ] as const, [timelineStep]);

  return (
    <main className="checkout-shell">
      <header className="checkout-header">
        <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="icon-button grid !h-10 !w-10" aria-label="Voltar para o site"><ArrowLeft size={19} /></Link>
            <div className="bot-avatar"><video className="bot-avatar-video" autoPlay loop muted playsInline preload="auto" aria-hidden="true"><source src="/cessi-avatar.mp4" type="video/mp4" /></video></div>
            <div><p className="text-sm font-extrabold tracking-[-.02em]">Cessi</p><p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#168a76]"><span className="h-1.5 w-1.5 rounded-full bg-[#00bea5]" /> Atendimento online · Suporte disponível</p></div>
          </div>
          <Image src="/logo-acesso.svg" alt="Acesso+" width={748} height={109} className="hidden h-auto w-[105px] sm:block" />
        </div>
      </header>

      <div className="mx-auto grid h-[calc(100svh-68px)] max-w-[1180px] lg:grid-cols-[minmax(0,1fr)_350px]">
        <section className="flex min-h-0 flex-col border-x border-[#e2e6ee] bg-white">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8" aria-live="polite">
            <div className="mx-auto max-w-[700px] space-y-4">
              <div className="mb-7 flex items-center justify-center gap-2 text-[11px] font-semibold text-[#8992a6]"><LockKeyhole size={13} /> Conversa privada e protegida</div>
              {messages.map((message) => (
                <div key={message.id} className={message.sender === 'customer' ? 'flex justify-end' : message.sender === 'system' ? 'flex justify-center' : 'flex justify-start'}>
                  {message.sender === 'system' ? (
                    <div className="system-message"><ShieldCheck size={14} /> {message.content}</div>
                  ) : (
                    <div className={`chat-bubble ${message.sender === 'customer' ? 'customer-bubble' : 'assistant-bubble'}`}>
                      {message.sender === 'assistant' && <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.08em] text-[#6457d3]">Cessi</span>}
                      {message.content}
                    </div>
                  )}
                </div>
              ))}

              {step === 'confirm' && (
                <div className="ml-auto max-w-[510px] rounded-[22px] border border-[#dce2ec] bg-[#f8f9fc] p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[.1em] text-[#68738d]">Seu pedido</p>
                  <h2 className="mt-2 text-lg font-extrabold">Gemini Pro</h2>
                  <p className="mt-1 text-sm text-[#68738d]">18 meses de acesso</p>
                  <div className="mt-5 flex items-end justify-between border-t border-[#e0e5ed] pt-5"><span className="text-sm text-[#68738d]">Pagamento único</span><strong className="text-2xl tracking-[-.04em]">R$ 67,90</strong></div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="flex flex-wrap justify-end gap-2 pt-1"><button onClick={askQuestion} className="quick-reply secondary">Tenho uma dúvida</button><button onClick={continueOrder} className="quick-reply">Sim, continuar <ChevronRight size={16} /></button></div>
              )}

              {syncError && <div className="mx-auto max-w-[510px] rounded-xl border border-[#ffcbd1] bg-[#fff0f2] p-3 text-xs font-bold leading-5 text-[#9c3d4b]">{syncError}</div>}

              {step === 'phone' && <div className="flex justify-end"><button disabled={creatingOrder} onClick={() => void createOrder()} className="quick-reply secondary disabled:opacity-50">{creatingOrder ? 'Criando pedido...' : 'Pular por enquanto'}</button></div>}

              {step === 'payment' && (
                <div className="ml-auto max-w-[510px] rounded-[22px] border border-[#dce2ec] bg-[#f8f9fc] p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-[#68738d]">Pedido {orderId}</p><h2 className="mt-2 text-lg font-extrabold">Gemini Pro · 18 meses</h2></div><span className="rounded-full bg-[#fff1c8] px-3 py-1 text-[10px] font-extrabold text-[#8b6418]">AGUARDANDO PAGAMENTO</span></div>
                  <div className="mt-5 flex items-end justify-between border-t border-[#e0e5ed] pt-5"><span className="text-sm text-[#68738d]">Total</span><strong className="text-2xl tracking-[-.04em]">R$ 67,90</strong></div>
                  <div className="mt-4 rounded-xl border border-[#dce2ec] bg-white p-3 text-xs leading-5 text-[#68738d]">O pagamento é processado pela Cakto e será aberto em uma nova aba. Sua conversa continuará salva aqui.</div>
                  <a href={`https://pay.cakto.com.br/378w2xn_1049695?sck=${encodeURIComponent(orderId)}`} target="_blank" rel="noopener noreferrer" onClick={openPaymentPage} className="quick-reply mt-4 w-full justify-center">Ir para o pagamento <ChevronRight size={16} /></a>
                </div>
              )}

              {step === 'preparing' && (
                <div className="ml-auto max-w-[510px] rounded-[20px] border border-[#d8e9e5] bg-[#f3fbf9] p-5"><p className="text-xs font-extrabold uppercase tracking-[.1em] text-[#168a76]">Pagamento confirmado</p><p className="mt-2 text-sm leading-6 text-[#506a65]">A equipe recebeu seu pedido e está preparando a ativação. Esta conversa será atualizada automaticamente.</p></div>
              )}

              {step === 'delivered' && (
                <div className="ml-auto max-w-[510px] rounded-[22px] border border-[#cce9e3] bg-[#f2fcf9] p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#00bea5] text-white"><Check size={20} /></span><div><p className="font-extrabold">Acesso entregue</p><p className="text-xs text-[#648078]">Sua ativação foi concluída</p></div></div>{serverOrder?.delivery_url ? <a href={serverOrder.delivery_url} target="_blank" rel="noopener noreferrer" className="quick-reply mt-4 w-full justify-center">Acessar agora <ChevronRight size={16} /></a> : <p className="mt-4 text-xs text-[#648078]">O link de acesso foi enviado na conversa.</p>}</div>
              )}
              <div ref={messageEnd} />
            </div>
          </div>

          <form onSubmit={submitText} className="border-t border-[#e3e7ee] bg-white p-3 sm:p-4">
            <div className="mx-auto flex max-w-[720px] items-end gap-2 rounded-[17px] border border-[#d9dfe9] bg-[#f8f9fc] p-2 focus-within:border-[#7668df] focus-within:ring-4 focus-within:ring-[#7668df]/10">
              <label className="sr-only" htmlFor="chat-input">{placeholder}</label>
              <input id="chat-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} className="min-h-11 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-[#98a0b0]" autoComplete={step === 'email' ? 'email' : step === 'name' ? 'name' : 'off'} />
              <button className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#192444] text-white disabled:opacity-40" disabled={!input.trim()} aria-label="Enviar mensagem"><Send size={18} /></button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#99a1b1]">Nunca envie senhas, códigos de autenticação ou dados completos de cartão pelo chat.</p>
          </form>
        </section>

        <aside className="hidden overflow-y-auto bg-[#f7f9fc] p-6 lg:block">
          <div className="rounded-[22px] border border-[#dfe4ed] bg-white p-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-[.1em] text-[#6f7890]">Seu pedido</p>
            <h2 className="mt-3 font-extrabold">Gemini Pro</h2>
            <div className="mt-1 flex justify-between text-sm text-[#6d7790]"><span>18 meses de acesso</span><span>R$ 67,90</span></div>
            {orderId && <p className="mt-4 rounded-xl bg-[#f4f6fa] px-3 py-2 text-xs font-bold text-[#56617a]">Pedido {orderId}</p>}
          </div>

          <div className="mt-5 rounded-[22px] border border-[#dfe4ed] bg-white p-5">
            <p className="text-xs font-extrabold uppercase tracking-[.1em] text-[#6f7890]">Acompanhamento</p>
            <div className="mt-5 space-y-0">
              {timeline.map(([label, completed], index) => (
                <div key={label} className="relative flex min-h-14 gap-3">
                  {index < timeline.length - 1 && <span className={`absolute left-[11px] top-6 h-[calc(100%-2px)] w-px ${completed ? 'bg-[#7fd8c9]' : 'bg-[#dfe4ed]'}`} />}
                  <span className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full ${completed ? 'bg-[#00bea5] text-white' : 'border border-[#d4dae5] bg-white text-[#98a0b1]'}`}>{completed ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span>
                  <div><p className={`text-sm font-bold ${completed ? 'text-[#30405d]' : 'text-[#9098a9]'}`}>{label}</p>{index === 3 && step === 'preparing' && <p className="mt-1 text-xs text-[#788198]">Equipe preparando seu acesso</p>}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-[#dfe4ed] bg-white p-4 text-xs leading-5 text-[#6c768e]">
            <p className="flex items-center gap-2 font-extrabold text-[#3a4763]"><Clock3 size={15} /> Atendimento online</p>
            <p className="mt-2">Sua conversa fica salva com segurança. Guarde este link para retornar.</p>
          </div>

          {(name || email) && <div className="mt-5 rounded-[18px] border border-[#dfe4ed] bg-white p-4 text-xs text-[#68738b]"><p className="flex items-center gap-2"><UserRound size={14} /> {firstName}</p>{email && <p className="mt-2 flex items-center gap-2"><Mail size={14} /> {email}</p>}</div>}
        </aside>
      </div>
    </main>
  );
}

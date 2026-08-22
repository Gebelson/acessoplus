'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  Headphones,
  Lightbulb,
  Menu,
  MessageCircle,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const benefits = [
  { icon: BriefcaseBusiness, title: 'Para trabalhar', text: 'Produza textos, analise informações e organize sua rotina com muito mais agilidade.', color: 'violet' },
  { icon: BookOpen, title: 'Para estudar', text: 'Crie resumos, entenda temas complexos e revise conteúdos no seu ritmo.', color: 'mint' },
  { icon: Lightbulb, title: 'Para criar', text: 'Transforme ideias em roteiros, imagens, conteúdos e novas possibilidades.', color: 'blue' },
  { icon: Code2, title: 'Para programar', text: 'Escreva código, encontre bugs e acelere projetos com explicações claras.', color: 'navy' },
  { icon: Search, title: 'Para o dia a dia', text: 'Pesquise, compare opções e planeje decisões pessoais com mais contexto.', color: 'amber' },
];

const faqs = [
  ['É realmente por 18 meses?', 'Sim. O produto anunciado nesta oferta corresponde a 18 meses de acesso. As condições do pedido ficam registradas na conversa antes do pagamento.'],
  ['Preciso pagar todo mês?', 'Não. O valor de R$ 149,90 é um pagamento único para esta oferta. Não há mensalidade recorrente da Acesso+.'],
  ['Como recebo meu acesso?', 'Depois da confirmação do pagamento, nossa equipe prepara o acesso e envia o link diretamente na conversa exclusiva do seu pedido.'],
  ['Quanto tempo demora?', 'Durante o horário de atendimento, a preparação começa logo após a confirmação. Se a equipe estiver em modo fila, mostramos o horário previsto antes do pagamento.'],
  ['Preciso fornecer minha senha?', 'Não solicitamos sua senha no checkout. Caso qualquer etapa adicional seja necessária, ela será explicada com clareza pela equipe de ativação.'],
  ['Funciona no celular e no computador?', 'Sim. Você pode acompanhar o pedido e usar o serviço em dispositivos compatíveis com o Google AI Pro.'],
  ['Existe suporte?', 'Sim. Você pode continuar respondendo na própria conversa do pedido e pedir atendimento humano quando precisar.'],
  ['Como funciona o reembolso?', 'Os critérios de reembolso são apresentados antes da compra e avaliados pelo suporte conforme o estágio da ativação e a legislação aplicável.'],
];

function CTA({ className = '', children = 'Quero meu acesso' }: { className?: string; children?: React.ReactNode }) {
  return (
    <Link className={`primary-button ${className}`} href="/checkout/novo">
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="overflow-hidden bg-[#f7f9fc] text-[#15203e]">
      <header className="sticky top-0 z-50 border-b border-[#e5e9f1]/80 bg-[#f7f9fc]/88 backdrop-blur-xl">
        <nav className="mx-auto flex h-[74px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10" aria-label="Navegação principal">
          <Link href="#inicio" aria-label="Acesso+ — início">
            <Image src="/logo-acesso.svg" alt="Acesso+" width={748} height={109} priority className="h-auto w-[136px] sm:w-[152px]" />
          </Link>
          <div className="hidden items-center gap-7 text-sm font-semibold text-[#596581] lg:flex">
            <Link href="#beneficios">Benefícios</Link>
            <Link href="#como-funciona">Como funciona</Link>
            <Link href="#oferta">Oferta</Link>
            <Link href="#faq">Dúvidas</Link>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#52617b]">
              <span className="h-2 w-2 rounded-full bg-[#00bea5] shadow-[0_0_0_4px_rgba(0,190,165,.12)]" />
              Ativações online
            </span>
            <CTA className="!min-h-[44px] !rounded-xl !px-4 !text-sm">Começar agora</CTA>
          </div>
          <button className="icon-button sm:hidden" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Abrir menu">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>
        {menuOpen && (
          <div className="border-t border-[#e5e9f1] bg-white px-5 py-5 sm:hidden">
            <div className="flex flex-col gap-4 text-sm font-semibold text-[#596581]">
              <Link onClick={() => setMenuOpen(false)} href="#beneficios">Benefícios</Link>
              <Link onClick={() => setMenuOpen(false)} href="#como-funciona">Como funciona</Link>
              <Link onClick={() => setMenuOpen(false)} href="#oferta">Oferta</Link>
              <Link onClick={() => setMenuOpen(false)} href="#faq">Dúvidas</Link>
              <CTA className="mt-2">Começar conversa</CTA>
            </div>
          </div>
        )}
      </header>

      <section id="inicio" className="relative mx-auto grid min-h-[calc(100svh-74px)] w-full max-w-[1240px] scroll-mt-20 items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-24">
        <div className="relative z-10 max-w-[690px]">
          <div className="eyebrow"><Sparkles size={14} /> ACESSO PREMIUM · 18 MESES</div>
          <h1 className="mt-6 text-[clamp(2.85rem,6vw,5.35rem)] font-semibold leading-[.96] tracking-[-.06em] text-[#15203e]">
            IA avançada sem pagar uma fortuna.
          </h1>
          <p className="mt-7 max-w-[625px] text-lg leading-8 text-[#596581] sm:text-xl">
            Tenha acesso ao Google AI Pro por 18 meses e use IA para trabalhar, estudar, criar, pesquisar e programar com mais produtividade.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <CTA>Quero garantir meu acesso</CTA>
            <div className="flex items-center gap-3 px-1 text-sm text-[#65708a]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"><MessageCircle size={17} /></span>
              Compra assistida pelo chat
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-[#dce2ed] pt-7 sm:flex sm:flex-wrap sm:gap-6">
            {['Pagamento único', 'Entrega digital', 'Ativação assistida', 'Suporte humano'].map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm font-semibold text-[#53607b]"><Check size={15} className="text-[#00a891]" />{item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:justify-self-end">
          <div className="hero-glow" aria-hidden="true" />
          <div className="offer-card relative z-10">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#eef1ff] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.12em] text-[#6557df]">Oferta Acesso+</span>
              <span className="flex items-center gap-2 text-xs font-bold text-[#217769]"><span className="h-2 w-2 rounded-full bg-[#00bea5]" /> Disponível</span>
            </div>
            <div className="mt-9 flex items-end justify-between gap-5">
              <div>
                <div className="text-[5.7rem] font-semibold leading-[.8] tracking-[-.09em] text-[#192444] sm:text-[7.5rem]">18</div>
                <div className="mt-3 text-2xl font-semibold tracking-[-.04em]">meses de acesso</div>
              </div>
              <div className="banana-mark" aria-label="Preço de banana">🍌</div>
            </div>
            <div className="mt-9 rounded-[22px] border border-[#e3e7f0] bg-[#f8f9fd] p-5">
              <div className="flex items-end justify-between gap-4">
                <div><p className="text-sm text-[#6b7590]">Pagamento único</p><p className="mt-1 text-4xl font-semibold tracking-[-.055em]">R$ 149,90</p></div>
                <span className="mb-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#586480] shadow-sm">sem mensalidade</span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs text-[#6d7790]"><span>Google AI Pro</span><span>Ativação assistida</span></div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e2e7ef] bg-white/70">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-6 px-5 py-7 sm:grid-cols-4 sm:px-8 lg:px-10">
          {[
            [ShieldCheck, 'Compra transparente', 'Tudo registrado no chat'],
            [Zap, 'Entrega digital', 'Acompanhe em tempo real'],
            [Headphones, 'Suporte de verdade', 'Atendimento humano'],
            [MessageCircle, 'Sem checkout confuso', 'Conversa simples e guiada'],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return <div key={String(title)} className="flex gap-3"><ItemIcon className="mt-0.5 shrink-0 text-[#6557df]" size={20} /><div><p className="text-sm font-bold">{String(title)}</p><p className="mt-1 text-xs leading-5 text-[#727c94]">{String(text)}</p></div></div>;
          })}
        </div>
      </section>

      <section id="beneficios" className="section-shell scroll-mt-24">
        <div className="section-heading">
          <span className="section-kicker">UM ACESSO, MUITAS POSSIBILIDADES</span>
          <h2>Mais IA. Mais possibilidades. Mais resultados.</h2>
          <p>Uma ferramenta para acompanhar os seus próximos 18 meses — do primeiro rascunho ao projeto final.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {benefits.map(({ icon: Icon, title, text, color }, index) => (
            <article key={title} className={`benefit-card benefit-${color} ${index < 2 ? 'md:col-span-3' : 'md:col-span-2'}`}>
              <div className="benefit-icon"><Icon size={23} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="bg-[#192444] text-white scroll-mt-20">
        <div className="section-shell">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div className="section-heading !mx-0 !text-left">
              <span className="section-kicker !text-[#55ddc7]">PROCESSO CLARO DO INÍCIO AO FIM</span>
              <h2 className="!text-white">Seu acesso em quatro passos simples.</h2>
              <p className="!text-[#aeb8d1]">Você acompanha cada atualização pela mesma conversa e pode voltar quando quiser pelo link exclusivo.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['01', 'Faça seu pedido', 'Inicie a conversa e confirme a oferta.'],
                ['02', 'Realize o pagamento', 'Use o método disponível com segurança.'],
                ['03', 'Acesso em preparação', 'A equipe inicia a ativação após a confirmação.'],
                ['04', 'Receba seu acesso', 'O link chega na própria conversa.'],
              ].map(([number, title, text]) => (
                <div key={number} className="rounded-[22px] border border-white/10 bg-white/[.055] p-5">
                  <span className="text-xs font-extrabold tracking-[.15em] text-[#55ddc7]">{number}</span>
                  <h3 className="mt-6 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#aeb8d1]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="video-card">
          <div className="max-w-[540px]">
            <span className="section-kicker">VEJA EXATAMENTE COMO FUNCIONA</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Entenda a ativação antes de comprar.</h2>
            <p className="mt-4 max-w-[500px] leading-7 text-[#68738d]">Um passo a passo simples para mostrar o que você recebe, como acompanhar o pedido e identificar quando o acesso estiver ativo.</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.1em] text-[#8a93a8]">Vídeo demonstrativo em breve</p>
          </div>
          <button className="play-button" aria-label="Reproduzir vídeo explicativo" disabled title="Vídeo em breve"><Play size={26} fill="currentColor" /></button>
        </div>
      </section>

      <section id="oferta" className="section-shell scroll-mt-24 !pt-4">
        <div className="pricing-wrap">
          <div className="max-w-[560px]">
            <span className="section-kicker">UMA OFERTA SIMPLES E TRANSPARENTE</span>
            <h2 className="mt-4 text-[clamp(2.2rem,5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-.055em]">18 meses para fazer mais com IA.</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Pagamento único', 'Sem cobrança mensal da Acesso+', 'Entrega na conversa', 'Suporte durante a ativação'].map((item) => (
                <span key={item} className="flex items-center gap-3 text-sm font-semibold text-[#53607b]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#def8f3] text-[#008d7a]"><Check size={14} /></span>{item}</span>
              ))}
            </div>
          </div>
          <div className="price-box">
            <p className="text-sm font-semibold text-[#717b93]">Google AI Pro · 18 meses</p>
            <p className="mt-5 text-sm text-[#717b93]">Pagamento único de</p>
            <p className="mt-1 text-5xl font-semibold tracking-[-.065em]">R$ 149,90</p>
            <CTA className="mt-7 w-full">Quero meu acesso</CTA>
            <p className="mt-4 text-center text-xs leading-5 text-[#7c8599]">Você confere todo o pedido na conversa antes de pagar.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="section-shell scroll-mt-24">
        <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <div className="section-heading !mx-0 !text-left">
            <span className="section-kicker">DÚVIDAS FREQUENTES</span>
            <h2>Antes de continuar, tire suas dúvidas.</h2>
            <p>Se ainda precisar, inicie uma conversa e peça para falar com a equipe.</p>
          </div>
          <div className="divide-y divide-[#e1e6ef] border-y border-[#e1e6ef]">
            {faqs.map(([question, answer]) => (
              <details key={question} className="faq-item group">
                <summary><span>{question}</span><ChevronDown size={19} className="faq-chevron" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center rounded-[32px] bg-[#5e50d7] px-6 py-14 text-center text-white sm:px-12 sm:py-18">
          <span className="text-xs font-extrabold tracking-[.14em] text-[#d5d0ff]">PRONTO PARA COMEÇAR?</span>
          <h2 className="mt-4 max-w-[720px] text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Seu próximo projeto pode começar com uma conversa.</h2>
          <CTA className="mt-8 !bg-white !text-[#4035aa] !shadow-none">Garantir 18 meses de acesso</CTA>
        </div>
      </section>

      <footer className="mt-10 border-t border-[#e0e5ed] bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] lg:px-10">
          <div>
            <Image src="/logo-acesso.svg" alt="Acesso+" width={748} height={109} className="h-auto w-[130px]" />
            <p className="mt-4 max-w-[560px] text-xs leading-5 text-[#7a849b]">A Acesso+ comercializa acesso digital com ativação assistida. Não somos parceiros, representantes ou afiliados oficiais do Google. Todas as marcas citadas pertencem aos seus respectivos proprietários.</p>
          </div>
          <div className="flex gap-6 text-xs font-semibold text-[#66718a]"><Link href="/checkout/novo">Comprar</Link><Link href="/admin">Painel demo</Link><a href="mailto:suporte@acessoplus.com.br">Suporte</a></div>
        </div>
      </footer>
    </main>
  );
}

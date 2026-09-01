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
  LayoutGrid,
  Lightbulb,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react';

const benefits = [
  { icon: BriefcaseBusiness, title: 'Trabalho', text: 'Escreva, revise, organize informações e acelere tarefas do dia a dia.', color: 'violet' },
  { icon: BookOpen, title: 'Estudos', text: 'Resuma conteúdos, entenda assuntos complexos e aprofunde suas pesquisas.', color: 'mint' },
  { icon: Lightbulb, title: 'Criação', text: 'Transforme ideias em textos, conceitos, imagens, vídeos e novos conteúdos.', color: 'blue' },
  { icon: Code2, title: 'Programação', text: 'Receba ajuda para escrever, analisar e corrigir código.', color: 'navy' },
  { icon: Search, title: 'Pesquisa', text: 'Explore assuntos em profundidade com os recursos avançados do Gemini.', color: 'amber' },
  { icon: LayoutGrid, title: 'Ecossistema Google', text: 'Use os recursos de IA disponíveis nos produtos Google compatíveis.', color: 'violet' },
];

const trustItems = [
  [ShieldCheck, 'Pedido registrado', 'Acompanhe todas as etapas'],
  [Zap, 'Ativação assistida', 'Receba orientação no processo'],
  [Headphones, 'Suporte humano', 'Fale diretamente com a equipe'],
  [MessageCircle, 'Entrega digital', 'Receba tudo online'],
];

const faqs = [
  ['O valor de R$ 67,90 é mensal?', 'Não. R$ 67,90 corresponde à oferta completa de 18 meses. Não há mensalidade recorrente cobrada pela Acesso+ nesse pedido.'],
  ['O acesso dura realmente 18 meses?', 'Sim. O período desta oferta é de 18 meses e essa informação aparece novamente para você conferir antes da conclusão do pagamento.'],
  ['O plano possui quanto de armazenamento?', 'O plano oferece até 5 TB de armazenamento, conforme as condições e a disponibilidade da conta ativada.'],
  ['Como recebo minha ativação?', 'Após a confirmação do pagamento, iniciamos o processo e enviamos as orientações necessárias pelo atendimento do seu pedido.'],
  ['Preciso enviar minha senha?', 'Não. Nunca envie senhas, códigos de autenticação ou códigos de verificação diretamente pelo chat.'],
  ['Posso usar no computador e no celular?', 'Sim. Você pode usar os serviços nos dispositivos e plataformas compatíveis com sua conta Google e com os recursos do plano.'],
  ['O que acontece se eu precisar de ajuda?', 'Retorne à conversa do seu pedido e solicite suporte. Nossa equipe poderá acompanhar o histórico e orientar você durante o processo.'],
  ['A Acesso+ é do Google?', 'Não. A Acesso+ é uma empresa independente e não possui vínculo, representação, afiliação ou parceria oficial com o Google.'],
];

const comparisonBenefits = [
  'Acesso ampliado aos modelos avançados do Gemini',
  'Gemini com limites superiores',
  'Deep Research',
  'Recursos avançados de geração e criação',
  'Google Flow',
  'NotebookLM com recursos e limites ampliados',
  'Gemini integrado aos aplicativos Google compatíveis',
  'Google AI Studio',
  'Google Antigravity',
  'Google Developer Program Premium',
  '5 TB de armazenamento',
  'Outros recursos disponibilizados pelo Google para contas elegíveis',
];

function CTA({ className = '', children = 'Quero meu acesso' }: { className?: string; children?: ReactNode }) {
  return (
    <Link className={`primary-button ${className}`} href="/checkout/novo">
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}

function useRevealMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const centerActivatedElements = Array.from(document.querySelectorAll<HTMLElement>('[data-center-activate]'));

    root.classList.add('motion-ready');

    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return () => root.classList.remove('motion-ready');
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });

    elements.forEach((element) => observer.observe(element));

    const centerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-centered', entry.isIntersecting));
    }, { threshold: 0.01, rootMargin: '-38% 0px -38% 0px' });

    centerActivatedElements.forEach((element) => centerObserver.observe(element));

    return () => {
      observer.disconnect();
      centerObserver.disconnect();
      root.classList.remove('motion-ready');
    };
  }, []);
}

function TiltSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    if (!surface || reducedMotion || !isTouchDevice || !('DeviceOrientationEvent' in window)) return;

    let baselineBeta: number | null = null;
    let baselineGamma: number | null = null;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;
      baselineBeta ??= event.beta;
      baselineGamma ??= event.gamma;

      const tiltX = Math.max(-1, Math.min(1, (event.beta - baselineBeta) / 28));
      const tiltY = Math.max(-1, Math.min(1, (event.gamma - baselineGamma) / 22));
      surface.style.setProperty('--tilt-x', `${tiltX * -7}deg`);
      surface.style.setProperty('--tilt-y', `${tiltY * 9}deg`);
      surface.style.setProperty('--shine-x', `${50 + tiltY * 45}%`);
      surface.style.setProperty('--shine-y', `${50 + tiltX * 45}%`);
    };

    const orientationApi = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<string>;
    };
    const requestPermission = () => {
      orientationApi.requestPermission?.().catch(() => undefined);
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    if (orientationApi.requestPermission) window.addEventListener('pointerdown', requestPermission, { once: true, passive: true });

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (orientationApi.requestPermission) window.removeEventListener('pointerdown', requestPermission);
    };
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 10}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 12}deg`);
    event.currentTarget.style.setProperty('--shine-x', `${x * 100}%`);
    event.currentTarget.style.setProperty('--shine-y', `${y * 100}%`);
  };

  const resetTilt = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
    event.currentTarget.style.setProperty('--shine-x', '50%');
    event.currentTarget.style.setProperty('--shine-y', '50%');
  };

  return <div ref={surfaceRef} className={`tilt-surface ${className}`} onPointerMove={handlePointerMove} onPointerLeave={resetTilt}>{children}</div>;
}

function AccessCore3D() {
  return (
    <div className="access-core-shell" aria-hidden="true">
      <div className="gemini-tile">
        <span className="gemini-tile-back" />
        <span className="gemini-tile-depth" />
        <span className="gemini-tile-face">
          <span className="gemini-tile-sheen" />
          <Image className="gemini-glyph" src="/gemini-star-3d.png" alt="" width={96} height={96} />
        </span>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  useRevealMotion();

  const scrollToSection = (sectionId: string, closeMenu = false) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (closeMenu) {
      setMenuOpen(false);
      window.setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
        const sectionTop = window.scrollY + section.getBoundingClientRect().top - headerHeight;
        window.scrollTo({ top: Math.max(0, sectionTop), behavior: 'auto' });
      }, 0);
      return;
    }

    const section = document.getElementById(sectionId);
    if (!section) return;
    const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top - headerHeight;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, sectionTop), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <main className="site-motion overflow-x-clip bg-[#f7f9fc] pt-[74px] text-[#15203e]">
      <header className="glass-header fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex h-[74px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-7" aria-label="Navegação principal">
          <button type="button" className="header-section-button" onClick={scrollToSection('inicio')} aria-label="Acesso+ — início">
            <Image src="/logo-acesso.svg" alt="Acesso+" width={748} height={109} priority className="h-auto w-[136px] sm:w-[152px]" />
          </button>
          <div className="hidden items-center gap-7 text-sm font-semibold text-[#596581] lg:flex">
            <button type="button" className="header-section-button" onClick={scrollToSection('beneficios')}>Benefícios</button>
            <button type="button" className="header-section-button" onClick={scrollToSection('como-funciona')}>Como funciona</button>
            <button type="button" className="header-section-button" onClick={scrollToSection('oferta')}>Oferta</button>
            <button type="button" className="header-section-button" onClick={scrollToSection('faq')}>Dúvidas</button>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#52617b]">
              <span className="h-2 w-2 rounded-full bg-[#00bea5] shadow-[0_0_0_4px_rgba(0,190,165,.12)]" />
              Ativações online
            </span>
            <CTA className="!min-h-[44px] !rounded-xl !px-4 !text-sm">Começar agora</CTA>
          </div>
          <button className="icon-button grid sm:hidden" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Abrir menu">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>
        {menuOpen && (
          <div className="glass-mobile-menu border-t border-white/60 px-4 py-5 sm:hidden">
            <div className="flex flex-col gap-4 text-sm font-semibold text-[#596581]">
              <button type="button" className="header-section-button" onClick={scrollToSection('beneficios', true)}>Benefícios</button>
              <button type="button" className="header-section-button" onClick={scrollToSection('como-funciona', true)}>Como funciona</button>
              <button type="button" className="header-section-button" onClick={scrollToSection('oferta', true)}>Oferta</button>
              <button type="button" className="header-section-button" onClick={scrollToSection('faq', true)}>Dúvidas</button>
              <CTA className="mt-2">Começar conversa</CTA>
            </div>
          </div>
        )}
      </header>

      <section id="inicio" className="hero-scene relative mx-auto grid min-h-[calc(100svh-74px)] w-full max-w-[1440px] scroll-mt-20 items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-7 lg:py-24">
        <div className="hero-depth-grid" aria-hidden="true" />
        <div className="relative z-10 order-2 max-w-[690px] lg:order-1" data-reveal>
          <div className="eyebrow hidden sm:inline-flex"><Sparkles size={14} /> 18 MESES · PAGAMENTO ÚNICO</div>
          <h1 className="hero-title mt-6 font-semibold leading-[.96] tracking-[-.06em] text-[#15203e]">
            <span>Gemini Pro por 18 meses.</span>
            <span>Pague uma única vez.</span>
          </h1>
          <p className="mt-7 max-w-[625px] text-lg leading-8 text-[#596581] sm:text-xl">
            Tenha acesso aos recursos avançados de IA do Google para trabalhar, estudar, pesquisar, criar conteúdo e desenvolver projetos.
          </p>
          <div className="hero-offer-price mt-7">
            <strong>R$ 67,90</strong>
            <span>18 meses · pagamento único</span>
          </div>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
            <CTA>Quero meu acesso</CTA>
          </div>
          <p className="hero-microcopy mt-4">Você confere todos os detalhes antes de pagar · Ativação digital · Suporte durante o processo</p>
        </div>

        <TiltSurface className="hero-card-stage relative order-1 mx-auto w-full max-w-[520px] lg:order-2 lg:justify-self-end">
          <span className="floating-chip floating-chip-one" aria-hidden="true"><Sparkles size={13} /> IA premium</span>
          <span className="floating-chip floating-chip-two" aria-hidden="true"><ShieldCheck size={13} /> Ativação guiada</span>
          <div className="offer-card gift-card relative z-10" data-reveal>
            <div className="gift-card-foil" aria-hidden="true" />
            <div className="gift-card-top">
              <div className="gift-card-brand">
                <Image src="/logo-acesso.svg" alt="Acesso+" width={748} height={109} className="gift-card-logo" />
                <span>GIFT CARD</span>
              </div>
              <span className="gift-card-status"><span /> DISPONÍVEL</span>
            </div>
            <div className="gift-card-main">
              <div className="gift-card-copy">
                <p className="gift-card-overline">ACESSO PREMIUM</p>
                <div className="gift-card-duration"><strong>18</strong><span>MESES</span></div>
                <p className="gift-card-product">Gemini Pro</p>
              </div>
              <AccessCore3D />
            </div>
            <div className="gift-card-bottom">
              <div className="gift-card-price"><span>VALOR ÚNICO</span><strong>R$ 67,90</strong></div>
              <div className="gift-card-seal"><ShieldCheck size={16} /><span>ATIVAÇÃO<br />ASSISTIDA</span></div>
            </div>
            <div className="gift-card-serial"><span>ACESSO+ PREMIUM</span><span>18M · Gemini Pro</span></div>
          </div>
        </TiltSurface>
      </section>

      <section className="trust-strip border-y border-[#e2e7ef] bg-white/70" data-reveal aria-label="Vantagens da Acesso+">
        <div className="trust-marquee">
          {[false, true].map((isDuplicate) => (
            <div className="trust-group" aria-hidden={isDuplicate || undefined} key={isDuplicate ? 'duplicate' : 'primary'}>
              {trustItems.map(([Icon, title, text]) => {
                const ItemIcon = Icon as typeof ShieldCheck;
                return <div key={`${isDuplicate ? 'duplicate' : 'primary'}-${String(title)}`} className="trust-item"><ItemIcon className="shrink-0 text-[#6557df]" size={28} strokeWidth={1.9} /><div><p className="text-sm font-bold">{String(title)}</p><p className="mt-1 text-xs leading-5 text-[#727c94]">{String(text)}</p></div></div>;
              })}
            </div>
          ))}
        </div>
      </section>

      <section id="beneficios" className="section-shell scroll-mt-24">
        <div className="section-heading" data-reveal>
          <span className="section-kicker">18 MESES PARA FAZER MAIS</span>
          <h2>18 meses para fazer muito mais com IA.</h2>
          <p>Use o Gemini para acelerar tarefas, criar conteúdos, pesquisar, estudar, programar e trabalhar com mais produtividade.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {benefits.map(({ icon: Icon, title, text, color }, index) => (
            <article key={title} className={`benefit-card benefit-${color} md:col-span-2`} data-reveal data-center-activate style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}>
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
            <div className="section-heading !mx-0 !text-left" data-reveal>
              <span className="section-kicker !text-[#55ddc7]">SIMPLES DO PEDIDO À ATIVAÇÃO</span>
              <h2 className="!text-white">Seu acesso em poucos passos.</h2>
              <p className="!text-[#aeb8d1]">Confira a oferta, faça seu pedido e acompanhe a ativação pela mesma conversa.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['01', 'Faça seu pedido', 'Confira os detalhes da oferta e inicie sua ativação.'],
                ['02', 'Realize o pagamento', 'Revise todas as informações antes de concluir.'],
                ['03', 'A ativação é preparada', 'Após a confirmação do pagamento, o processo de ativação é iniciado.'],
                ['04', 'Receba seu acesso', 'As instruções e o acesso são enviados pelo atendimento.'],
              ].map(([number, title, text], index) => (
                <div key={number} className="process-step rounded-[22px] border border-white/10 bg-white/[.055] p-5" data-reveal data-center-activate style={{ '--reveal-delay': `${index * 80}ms` } as CSSProperties}>
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
        <div className="video-card" data-reveal>
          <div className="max-w-[540px]">
            <span className="section-kicker">VEJA COMO FUNCIONA</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Entenda o processo antes de comprar.</h2>
            <p className="mt-4 max-w-[500px] leading-7 text-[#68738d]">Veja como funciona o pedido, a ativação e o recebimento do seu acesso.</p>
          </div>
          <div className="video-stage">
            <video
              className="video-player"
              controls
              playsInline
              preload="metadata"
              poster="/acesso-poster.jpg"
              aria-label="Vídeo demonstrativo da ativação do acesso"
            >
              <source src="/acesso.mp4" type="video/mp4" />
              Seu navegador não suporta a reprodução deste vídeo.
            </video>
          </div>
        </div>
      </section>

      <section id="oferta" className="section-shell scroll-mt-24 !pt-4">
        <div className="offer-summary" data-reveal>
          <div className="offer-summary-copy">
            <span className="section-kicker">18 MESES · UMA ÚNICA COMPRA</span>
            <h2>Você paga uma vez. E pronto.</h2>
            <p>Garanta todo o período anunciado em um único pagamento, sem mensalidades recorrentes cobradas pela Acesso+.</p>
            <CTA className="mt-7">Quero garantir meus 18 meses</CTA>
          </div>
          <div className="offer-metrics" aria-label="Resumo da oferta">
            <div><strong>18 meses</strong><span>de acesso</span></div>
            <div><strong>R$ 67,90</strong><span>pagamento único</span></div>
            <div><strong>5 TB</strong><span>de armazenamento</span></div>
            <div><strong>Ativação digital</strong><span>com acompanhamento</span></div>
          </div>
        </div>
      </section>

      <section id="comparacao" className="section-shell scroll-mt-24 !pt-4">
        <div className="offer-heading" data-reveal>
          <span className="section-kicker">COMPARE</span>
          <h2>A diferença no preço fala por si.</h2>
          <p>Compare o preço anual de referência com a oferta de 18 meses da Acesso+.</p>
        </div>

        <div className="offer-comparison" data-reveal>
          <div className="comparison-plans">
            <article className="comparison-card comparison-card-original">
              <div className="comparison-card-topline">
                <span className="comparison-tag comparison-tag-neutral">PREÇO CONVENCIONAL</span>
                <span className="comparison-months">12 meses</span>
              </div>
              <p className="comparison-product">Google AI Pro</p>
              <p className="comparison-caption">Plano anual de referência</p>
              <p className="comparison-old-price">R$ 1.163,88</p>
              <div className="comparison-price-line">
                <strong>R$ 869,90</strong>
                <span>/ano</span>
              </div>
              <div className="comparison-summary comparison-summary-neutral">
                <span>Período</span>
                <strong>12 meses</strong>
              </div>
            </article>

            <article className="comparison-card comparison-card-access">
              <div className="comparison-card-topline">
                <div className="comparison-card-badges">
                  <span className="comparison-best-choice"><Sparkles size={14} aria-hidden="true" /> MELHOR ESCOLHA</span>
                  <span className="comparison-tag comparison-tag-access">OFERTA ACESSO+</span>
                </div>
                <span className="comparison-months comparison-months-access">18 meses</span>
              </div>
              <p className="comparison-product">Gemini Pro</p>
              <div className="bonus-equation" aria-label="12 meses mais 6 meses grátis">
                <span>12 meses</span>
                <strong>+</strong>
                <span className="bonus-pill">6 meses grátis</span>
              </div>
              <p className="comparison-payment-label">Pagamento único de</p>
              <div className="comparison-price-line comparison-price-access">
                <strong>R$ 67,90</strong>
              </div>
              <p className="comparison-saving">Economize R$ 802,00 em relação ao preço anual de referência — e receba 6 meses a mais.</p>
              <CTA className="mt-6 w-full">Quero meus 18 meses</CTA>
            </article>
          </div>

          <div className="included-heading">
            <span className="section-kicker">TUDO QUE VOCÊ DESBLOQUEIA</span>
            <h3>Muito mais que um chatbot.</h3>
            <p>A oferta da Acesso+ reúne os benefícios apresentados no plano de referência, com 18 meses de acesso.</p>
          </div>
          <div className="comparison-benefits" aria-label="Comparação de benefícios">
            <div className="comparison-benefit-row comparison-benefit-head">
              <span>Benefícios incluídos</span>
              <span>Original</span>
              <span>Acesso+</span>
            </div>
            {comparisonBenefits.map((benefit) => (
              <div className="comparison-benefit-row" key={benefit}>
                <span>{benefit}</span>
                <span className="comparison-check comparison-check-neutral" aria-label="Incluído na oferta original"><Check size={15} /></span>
                <span className="comparison-check comparison-check-access" aria-label="Incluído na oferta Acesso+"><Check size={15} /></span>
              </div>
            ))}
            <div className="comparison-benefit-row comparison-bonus-row">
              <span><strong>6 meses adicionais grátis</strong></span>
              <span className="comparison-not-included" aria-label="Não incluído na oferta original">—</span>
              <span className="comparison-check comparison-check-access" aria-label="Incluído na oferta Acesso+"><Check size={15} /></span>
            </div>
          </div>

          <p className="included-note">Gemini Pro é oferecido por meio dos benefícios associados ao plano Google AI Pro. Recursos, limites e disponibilidade podem variar conforme região, conta e atualizações realizadas pelo Google.</p>

          <div className="comparison-footer">
            <div><Check size={17} /><span>Pagamento único</span></div>
            <div><Check size={17} /><span>Sem mensalidade da Acesso+</span></div>
            <div><Check size={17} /><span>Ativação assistida</span></div>
            <div><Check size={17} /><span>Suporte humano</span></div>
          </div>
        </div>
        <p className="comparison-disclaimer">Comparação baseada no preço anual de R$ 869,90 apresentado na referência. Valores e condições do plano convencional podem mudar no canal oficial.</p>
      </section>

      <section id="faq" className="section-shell scroll-mt-24">
        <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <div className="section-heading !mx-0 !text-left" data-reveal>
            <span className="section-kicker">DÚVIDAS FREQUENTES</span>
            <h2>Antes de continuar, tire suas dúvidas.</h2>
            <p>Se ainda precisar, inicie uma conversa e peça para falar com a equipe.</p>
          </div>
          <div className="divide-y divide-[#e1e6ef] border-y border-[#e1e6ef]" data-reveal>
            {faqs.map(([question, answer]) => (
              <details key={question} name="acessoplus-faq" className="faq-item group">
                <summary><span>{question}</span><ChevronDown size={19} className="faq-chevron" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 lg:px-7">
        <div className="kinetic-cta relative mx-auto flex max-w-[1384px] flex-col items-center overflow-hidden rounded-[32px] bg-[#5e50d7] px-6 py-14 text-center text-white sm:px-12 sm:py-18" data-reveal>
          <span className="kinetic-plus kinetic-plus-one" aria-hidden="true">+</span>
          <span className="kinetic-plus kinetic-plus-two" aria-hidden="true">+</span>
          <span className="kinetic-plus kinetic-plus-three" aria-hidden="true">+</span>
          <span className="text-xs font-extrabold tracking-[.14em] text-[#d5d0ff]">PRONTO PARA COMEÇAR?</span>
          <h2 className="mt-4 max-w-[820px] text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Garanta seus próximos 18 meses de Gemini Pro.</h2>
          <p className="mt-5 max-w-[680px] text-sm leading-7 text-[#e1ddff] sm:text-base">Faça seu pedido, confira todos os detalhes e acompanhe sua ativação em um único lugar.</p>
          <div className="final-price mt-6"><strong>R$ 67,90</strong><span>18 meses · pagamento único</span></div>
          <CTA className="mt-8 !bg-white !text-[#4035aa] !shadow-none">Quero ativar agora</CTA>
          <p className="mt-5 text-xs font-semibold text-[#d5d0ff]">5 TB de armazenamento · Ativação digital · Suporte durante o processo</p>
        </div>
      </section>

      <footer className="mt-10 border-t border-[#e0e5ed] bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-7">
          <div>
            <Image src="/logo-acesso.svg" alt="Acesso+" width={748} height={109} className="h-auto w-[130px]" />
            <p className="mt-4 max-w-[620px] text-xs leading-5 text-[#7a849b]">A Acesso+ é uma empresa independente e não possui vínculo, representação, afiliação ou parceria oficial com o Google. Todas as marcas citadas pertencem aos seus respectivos proprietários.</p>
          </div>
          <div className="flex gap-6 text-xs font-semibold text-[#66718a]"><Link href="/checkout/novo">Comprar</Link><Link href="/admin">Painel demonstrativo</Link><a href="mailto:suporte@acessoplus.com.br">Suporte</a></div>
        </div>
      </footer>
    </main>
  );
}

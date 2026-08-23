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
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';

const benefits = [
  { icon: BriefcaseBusiness, title: 'Para trabalhar', text: 'Produza textos, analise informações e organize sua rotina com muito mais agilidade.', color: 'violet' },
  { icon: BookOpen, title: 'Para estudar', text: 'Crie resumos, entenda temas complexos e revise conteúdos no seu ritmo.', color: 'mint' },
  { icon: Lightbulb, title: 'Para criar', text: 'Transforme ideias em roteiros, imagens, conteúdos e novas possibilidades.', color: 'blue' },
  { icon: Code2, title: 'Para programar', text: 'Escreva código, encontre bugs e acelere projetos com explicações claras.', color: 'navy' },
  { icon: Search, title: 'Para o dia a dia', text: 'Pesquise, compare opções e planeje decisões pessoais com mais contexto.', color: 'amber' },
];

const faqs = [
  ['É realmente por 18 meses?', 'Sim. O produto anunciado nesta oferta corresponde a 18 meses de acesso. As condições do pedido ficam registradas na conversa antes do pagamento.'],
  ['Preciso pagar todo mês?', 'Não. O valor de R$ 67,90 é um pagamento único para esta oferta. Não há mensalidade recorrente da Acesso+.'],
  ['Como recebo meu acesso?', 'Depois da confirmação do pagamento, nossa equipe prepara o acesso e envia o link diretamente na conversa exclusiva do seu pedido.'],
  ['Quanto tempo demora?', 'Durante o horário de atendimento, a preparação começa logo após a confirmação. Se a equipe estiver em modo fila, mostramos o horário previsto antes do pagamento.'],
  ['Preciso fornecer minha senha?', 'Não solicitamos sua senha no checkout. Caso qualquer etapa adicional seja necessária, ela será explicada com clareza pela equipe de ativação.'],
  ['Funciona no celular e no computador?', 'Sim. Você pode acompanhar o pedido e usar o serviço em dispositivos compatíveis com o Gemini PRO.'],
  ['Existe suporte?', 'Sim. Você pode continuar respondendo na própria conversa do pedido e pedir atendimento humano quando precisar.'],
  ['Como funciona o reembolso?', 'Os critérios de reembolso são apresentados antes da compra e avaliados pelo suporte conforme o estágio da ativação e a legislação aplicável.'],
];

const comparisonBenefits = [
  'Gemini PRO e modelos avançados',
  '2 TB de armazenamento',
  'Google Flow e Flow Music',
  'Pesquisa Google e Notebook',
  'Gemini no Gmail, Docs, Vids e outros apps',
  'Antigravity e Developer Program',
  'Google AI Studio e Android Studio',
  'YouTube Premium Lite e Google Health Premium',
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

    return () => {
      observer.disconnect();
      root.classList.remove('motion-ready');
    };
  }, []);
}

function TiltSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
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

  return <div className={`tilt-surface ${className}`} onPointerMove={handlePointerMove} onPointerLeave={resetTilt}>{children}</div>;
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

  return (
    <main className="site-motion overflow-hidden bg-[#f7f9fc] pt-[74px] text-[#15203e]">
      <header className="glass-header fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex h-[74px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-7" aria-label="Navegação principal">
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
          <button className="icon-button grid sm:hidden" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Abrir menu">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>
        {menuOpen && (
          <div className="glass-mobile-menu border-t border-white/60 px-4 py-5 sm:hidden">
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

      <section id="inicio" className="hero-scene relative mx-auto grid min-h-[calc(100svh-74px)] w-full max-w-[1440px] scroll-mt-20 items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-7 lg:py-24">
        <div className="hero-depth-grid" aria-hidden="true" />
        <span className="hero-orb hero-orb-one" aria-hidden="true" />
        <span className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="relative z-10 max-w-[690px]" data-reveal>
          <div className="eyebrow"><Sparkles size={14} /> ACESSO PREMIUM · 18 MESES</div>
          <h1 className="mt-6 text-[clamp(2.85rem,6vw,5.35rem)] font-semibold leading-[.96] tracking-[-.06em] text-[#15203e]">
            IA avançada sem pagar uma fortuna.
          </h1>
          <p className="mt-7 max-w-[625px] text-lg leading-8 text-[#596581] sm:text-xl">
            Tenha acesso ao Gemini PRO por 18 meses e use IA para trabalhar, estudar, criar, pesquisar e programar com mais produtividade.
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

        <TiltSurface className="hero-card-stage relative mx-auto w-full max-w-[520px] lg:justify-self-end">
          <div className="hero-glow" aria-hidden="true" />
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
                <p className="gift-card-product">Gemini PRO</p>
              </div>
              <AccessCore3D />
            </div>
            <div className="gift-card-bottom">
              <div className="gift-card-price"><span>VALOR ÚNICO</span><strong>R$ 67,90</strong></div>
              <div className="gift-card-seal"><ShieldCheck size={16} /><span>ATIVAÇÃO<br />ASSISTIDA</span></div>
            </div>
            <div className="gift-card-serial"><span>ACESSO+ PREMIUM</span><span>18M · GEMINI PRO</span></div>
          </div>
        </TiltSurface>
      </section>

      <section className="trust-strip border-y border-[#e2e7ef] bg-white/70" data-reveal>
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-6 px-4 py-7 sm:grid-cols-4 sm:px-6 lg:px-7">
          {[
            [ShieldCheck, 'Compra transparente', 'Tudo registrado no chat'],
            [Zap, 'Entrega digital', 'Acompanhe em tempo real'],
            [Headphones, 'Suporte de verdade', 'Atendimento humano'],
            [MessageCircle, 'Sem checkout confuso', 'Conversa simples e guiada'],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return <div key={String(title)} className="trust-item"><ItemIcon className="shrink-0 text-[#6557df]" size={28} strokeWidth={1.9} /><div><p className="text-sm font-bold">{String(title)}</p><p className="mt-1 text-xs leading-5 text-[#727c94]">{String(text)}</p></div></div>;
          })}
        </div>
      </section>

      <section id="beneficios" className="section-shell scroll-mt-24">
        <div className="section-heading" data-reveal>
          <span className="section-kicker">UM ACESSO, MUITAS POSSIBILIDADES</span>
          <h2>Mais IA. Mais possibilidades. Mais resultados.</h2>
          <p>Uma ferramenta para acompanhar os seus próximos 18 meses — do primeiro rascunho ao projeto final.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {benefits.map(({ icon: Icon, title, text, color }, index) => (
            <article key={title} className={`benefit-card benefit-${color} ${index < 2 ? 'md:col-span-3' : 'md:col-span-2'}`} data-reveal style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}>
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
              ].map(([number, title, text], index) => (
                <div key={number} className="process-step rounded-[22px] border border-white/10 bg-white/[.055] p-5" data-reveal style={{ '--reveal-delay': `${index * 80}ms` } as CSSProperties}>
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
            <span className="section-kicker">VEJA EXATAMENTE COMO FUNCIONA</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Entenda a ativação antes de comprar.</h2>
            <p className="mt-4 max-w-[500px] leading-7 text-[#68738d]">Um passo a passo simples para mostrar o que você recebe, como acompanhar o pedido e identificar quando o acesso estiver ativo.</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.1em] text-[#8a93a8]">Demonstração completa · 43 segundos</p>
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
        <div className="offer-heading" data-reveal>
          <span className="section-kicker">COMPARE E ESCOLHA</span>
          <h2>Tudo do plano anual. Mais 6 meses por nossa conta.</h2>
          <p>Na Acesso+, você recebe os mesmos benefícios apresentados na oferta original, mas leva 18 meses no total: 12 meses de acesso + 6 meses grátis.</p>
        </div>

        <div className="offer-comparison" data-reveal>
          <div className="comparison-plans">
            <article className="comparison-card comparison-card-original">
              <div className="comparison-card-topline">
                <span className="comparison-tag comparison-tag-neutral">OFERTA ORIGINAL DA REFERÊNCIA</span>
                <span className="comparison-months">12 meses</span>
              </div>
              <p className="comparison-product">Google AI Pro</p>
              <p className="comparison-caption">Plano anual apresentado</p>
              <p className="comparison-old-price">R$ 1.163,88</p>
              <div className="comparison-price-line">
                <strong>R$ 869,90</strong>
                <span>/ano</span>
              </div>
              <div className="comparison-summary comparison-summary-neutral">
                <span>Tempo total</span>
                <strong>1 ano</strong>
              </div>
            </article>

            <article className="comparison-card comparison-card-access">
              <span className="comparison-best-choice"><Sparkles size={14} aria-hidden="true" /> MELHOR ESCOLHA</span>
              <div className="comparison-card-topline">
                <span className="comparison-tag comparison-tag-access">OFERTA ACESSO+</span>
                <span className="comparison-months comparison-months-access">18 meses</span>
              </div>
              <p className="comparison-product">Gemini PRO</p>
              <div className="bonus-equation" aria-label="12 meses mais 6 meses grátis">
                <span>12 meses</span>
                <strong>+</strong>
                <span className="bonus-pill">6 meses grátis</span>
              </div>
              <p className="comparison-payment-label">Pagamento único de</p>
              <div className="comparison-price-line comparison-price-access">
                <strong>R$ 67,90</strong>
              </div>
              <p className="comparison-saving">R$ 802,00 a menos que o valor anual da referência</p>
              <CTA className="mt-6 w-full">Quero 18 meses de acesso</CTA>
            </article>
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

          <div className="comparison-footer">
            <div><Check size={17} /><span>Pagamento único</span></div>
            <div><Check size={17} /><span>Sem mensalidade da Acesso+</span></div>
            <div><Check size={17} /><span>Ativação assistida</span></div>
            <div><Check size={17} /><span>Suporte humano</span></div>
          </div>
        </div>
        <p className="comparison-disclaimer">Comparação baseada nos valores e benefícios visíveis na referência enviada. As condições da oferta original podem mudar no canal oficial.</p>
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
          <h2 className="mt-4 max-w-[720px] text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Seu próximo projeto pode começar com uma conversa.</h2>
          <CTA className="mt-8 !bg-white !text-[#4035aa] !shadow-none">Garantir 18 meses de acesso</CTA>
        </div>
      </section>

      <footer className="mt-10 border-t border-[#e0e5ed] bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-7">
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

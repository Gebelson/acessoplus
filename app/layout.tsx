import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { CustomScrollbar } from './components/CustomScrollbar';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

const circularTransitionScript = `
(() => {
  const storageKey = 'acessoplus:circle-transition';
  const activeConversationKey = 'acessoplus:active-conversation';

  const conversationId = () => {
    const saved = localStorage.getItem(activeConversationKey)?.trim() || '';
    if (/^[a-zA-Z0-9_-]{12,100}$/.test(saved)) return saved;
    const created = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replaceAll('-', '').slice(0, 18)
      : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(activeConversationKey, created);
    return created;
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!target) return;

    const destination = new URL(target.href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    const currentPath = window.location.pathname;
    if (currentPath === '/' && destination.pathname === '/checkout/novo') {
      destination.pathname = '/checkout/' + conversationId();
    }
    const direction = currentPath === '/' && destination.pathname.startsWith('/checkout/')
      ? 'forward'
      : currentPath.startsWith('/checkout/') && destination.pathname === '/'
        ? 'back'
        : null;
    if (!direction) return;

    const bounds = target.getBoundingClientRect();
    const keyboardClick = event.detail === 0;
    const x = keyboardClick ? bounds.left + bounds.width / 2 : event.clientX;
    const y = keyboardClick ? bounds.top + bounds.height / 2 : event.clientY;

    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ x, y, direction, timestamp: Date.now() }));
    } catch {}

    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(destination.href);
  }, true);

  window.addEventListener('pagereveal', (event) => {
    let state;
    try {
      state = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      sessionStorage.removeItem(storageKey);
    } catch {
      state = null;
    }

    const transition = event.viewTransition;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!transition || !state || Date.now() - state.timestamp > 5000 || reducedMotion) return;

    const root = document.documentElement;
    root.dataset.circleTransition = state.direction;

    transition.ready.then(() => {
      const farthestX = Math.max(state.x, window.innerWidth - state.x);
      const farthestY = Math.max(state.y, window.innerHeight - state.y);
      const radius = Math.hypot(farthestX, farthestY);
      const expanded = 'circle(' + radius + 'px at ' + state.x + 'px ' + state.y + 'px)';
      const collapsed = 'circle(0px at ' + state.x + 'px ' + state.y + 'px)';
      const isBack = state.direction === 'back';

      const duration = isBack ? 980 : 1180;
      const circlePseudo = isBack ? '::view-transition-old(root)' : '::view-transition-new(root)';
      const backgroundPseudo = isBack ? '::view-transition-new(root)' : '::view-transition-old(root)';

      root.animate(
        { clipPath: isBack ? [expanded, collapsed] : [collapsed, expanded] },
        {
          duration,
          easing: isBack ? 'cubic-bezier(.65, 0, .35, 1)' : 'cubic-bezier(.4, 0, .2, 1)',
          fill: 'both',
          pseudoElement: circlePseudo,
        },
      );

      root.animate(
        isBack
          ? { filter: ['brightness(.68) saturate(.82)', 'brightness(1) saturate(1)'], transform: ['scale(.985)', 'scale(1)'] }
          : { filter: ['brightness(1) saturate(1)', 'brightness(.68) saturate(.82)'], transform: ['scale(1)', 'scale(.985)'] },
        {
          duration,
          easing: 'cubic-bezier(.4, 0, .2, 1)',
          fill: 'both',
          pseudoElement: backgroundPseudo,
        },
      );
    }).catch(() => {});

    transition.finished.finally(() => {
      delete root.dataset.circleTransition;
    });
  });
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Acesso+ | Gemini Pro por 18 meses',
  description: 'Gemini Pro por 18 meses por R$ 67,90 em pagamento único, com 5 TB de armazenamento, ativação digital e suporte.',
  openGraph: {
    title: 'Acesso+ | Gemini Pro por 18 meses',
    description: '18 meses de Gemini Pro por R$ 67,90 em pagamento único, com ativação digital acompanhada.',
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Acesso+ — Gemini Pro por 18 meses' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acesso+ | Gemini Pro por 18 meses',
    description: '18 meses de Gemini Pro por R$ 67,90 em pagamento único, com ativação digital acompanhada.',
    images: ['/og.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head><script dangerouslySetInnerHTML={{ __html: circularTransitionScript }} /></head>
      <body className={`${manrope.variable} antialiased`}>
        {children}
        <CustomScrollbar />
      </body>
    </html>
  );
}

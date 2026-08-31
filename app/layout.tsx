import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

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
      <body className={`${manrope.variable} antialiased`}>{children}</body>
    </html>
  );
}

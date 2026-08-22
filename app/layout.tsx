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
  title: 'Acesso+ | 18 meses de Gemini PRO',
  description: 'Acesso ao Gemini PRO por 18 meses, com pagamento único, ativação assistida e suporte.',
  openGraph: {
    title: 'Acesso+ | 18 meses de IA avançada',
    description: 'Pagamento único, ativação assistida e uma experiência de compra simples pelo chat.',
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Acesso+ — 18 meses de IA avançada' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acesso+ | 18 meses de IA avançada',
    description: 'Pagamento único, ativação assistida e uma experiência de compra simples pelo chat.',
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

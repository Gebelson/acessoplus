import type { Metadata } from 'next';
import { CheckoutExperience } from '../../components/CheckoutExperience';

export const metadata: Metadata = {
  title: 'Checkout conversacional | Acesso+',
  description: 'Conversa segura para criar e acompanhar seu pedido Acesso+.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  return <CheckoutExperience initialConversationId={conversationId} />;
}

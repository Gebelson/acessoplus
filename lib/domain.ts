export type PaymentStatus = 'PAYMENT_PENDING' | 'PAYMENT_CONFIRMED' | 'PAYMENT_FAILED' | 'PAYMENT_REFUNDED';

export type FulfillmentStatus =
  | 'NEW'
  | 'WAITING_PAYMENT'
  | 'PAID'
  | 'FULFILLMENT_PENDING'
  | 'SUPPLIER_ORDER_CREATED'
  | 'SUPPLIER_PAYMENT_PENDING'
  | 'SUPPLIER_PAYMENT_SENT'
  | 'SUPPLIER_PAYMENT_CONFIRMED'
  | 'ACCESS_RECEIVED'
  | 'DELIVERED'
  | 'REVIEW_REQUIRED'
  | 'FAILED';

export type OperationMode = 'ONLINE' | 'QUEUE' | 'PAUSED';
export type OrganicAutomationMode = 'MANUAL' | 'SEMI_AUTO' | 'AUTO';

export interface CorrelationContext {
  orderId: string;
  conversationId: string;
  supplierChatId?: string;
  supplierMessageId?: string;
  supplierOrderReference?: string;
}

export interface SupplierProvider {
  createOrder(context: CorrelationContext): Promise<{ supplierOrderReference: string }>;
  receivePaymentInstructions(context: CorrelationContext): Promise<unknown>;
  sendPaymentConfirmation(context: CorrelationContext, transactionId: string): Promise<void>;
  receiveDelivery(context: CorrelationContext): Promise<{ accessUrl: string }>;
  cancelOrder(context: CorrelationContext): Promise<void>;
}

export interface CryptoPaymentProvider {
  validateDestination(asset: string, network: string, address: string): Promise<boolean>;
  sendPayment(input: {
    idempotencyKey: string;
    orderId: string;
    asset: string;
    network: string;
    address: string;
    amount: string;
  }): Promise<{ transactionId: string }>;
}

export interface AgentOrchestratorProvider {
  runResearchCycle(): Promise<string>;
  generateContentIdeas(runId: string): Promise<string[]>;
  scoreIdeas(ideaIds: string[]): Promise<void>;
  createContent(ideaId: string): Promise<string>;
  createVariants(contentId: string): Promise<string[]>;
  schedulePublication(contentId: string): Promise<void>;
  collectMetrics(publicationId: string): Promise<void>;
  analyzePerformance(campaignId: string): Promise<void>;
  generateLearnings(campaignId: string): Promise<void>;
  recycleWinningContent(contentId: string): Promise<string[]>;
  pauseCampaign(campaignId: string): Promise<void>;
  requestHumanReview(subjectId: string, reason: string): Promise<void>;
}

export const criticalOperationRules = Object.freeze({
  requirePersistentCorrelation: true,
  requireIdempotencyKey: true,
  financialActionsBackendOnly: true,
  ambiguousDeliveryStatus: 'REVIEW_REQUIRED' as FulfillmentStatus,
});

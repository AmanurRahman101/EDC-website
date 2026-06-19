// Placeholder payment processor.
// Replace this with Stripe, LemonSqueezy, etc. when ready.

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
}

export async function createPayment(_amountCents: number, _orderId: string): Promise<PaymentResult> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 300));

  // Always succeed for placeholder
  return {
    success: true,
    transactionId: "pm_" + Math.random().toString(36).slice(2, 12),
    message: "Payment authorized (placeholder)",
  };
}

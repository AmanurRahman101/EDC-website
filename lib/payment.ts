// Placeholder payment processor.
// Replace this with Stripe, LemonSqueezy, etc. when ready.

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
}

export async function createPayment(amountCents: number, orderId: string): Promise<PaymentResult> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 300));

  // Always succeed for placeholder
  return {
    success: true,
    transactionId: `pm_${orderId.slice(0, 8)}_${amountCents}`,
    message: "Payment authorized (placeholder)",
  };
}

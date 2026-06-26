import { describe, it, expect, vi } from "vitest";
import { createPayment } from "../payment";
import type { PaymentResult } from "../payment";

describe("payment utilities", () => {
  describe("createPayment", () => {
    it("returns a successful result", async () => {
      vi.useFakeTimers();
      const promise = createPayment(5000, "order-abc12345-xyz");
      vi.advanceTimersByTime(300);
      const result: PaymentResult = await promise;

      expect(result.success).toBe(true);
      expect(result.message).toBe("Payment authorized (placeholder)");
      vi.useRealTimers();
    });

    it("generates a transaction ID from orderId and amount", async () => {
      vi.useFakeTimers();
      const promise = createPayment(12000, "order-99887766-end");
      vi.advanceTimersByTime(300);
      const result = await promise;

      expect(result.transactionId).toBe("pm_order-99_12000");
      vi.useRealTimers();
    });

    it("uses first 8 chars of orderId in transactionId", async () => {
      vi.useFakeTimers();
      const promise = createPayment(100, "abcdefghijklmnop");
      vi.advanceTimersByTime(300);
      const result = await promise;

      expect(result.transactionId).toBe("pm_abcdefgh_100");
      vi.useRealTimers();
    });

    it("handles zero amount", async () => {
      vi.useFakeTimers();
      const promise = createPayment(0, "order-zero0000");
      vi.advanceTimersByTime(300);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe("pm_order-ze_0");
      vi.useRealTimers();
    });

    it("resolves after simulated network latency (~300ms)", async () => {
      vi.useFakeTimers();
      const promise = createPayment(1000, "order-latency");
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });

      // Not yet resolved before 300ms
      vi.advanceTimersByTime(299);
      await vi.advanceTimersByTimeAsync(0);
      expect(resolved).toBe(false);

      // Resolves at 300ms
      vi.advanceTimersByTime(1);
      await vi.advanceTimersByTimeAsync(0);
      expect(resolved).toBe(true);
      vi.useRealTimers();
    });
  });
});

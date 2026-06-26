import { ProductStatus } from "@prisma/client";

export function isPurchasable(product: { status: ProductStatus; stock: number }): boolean {
  return (
    product.stock > 0 &&
    product.status !== ProductStatus.OUT_OF_STOCK &&
    product.status !== ProductStatus.BACKORDERED
  );
}

export function statusLabel(status: ProductStatus): string {
  if (status === ProductStatus.LIMITED_RUN) return "LIMITED_RUN";
  if (status === ProductStatus.IN_STOCK) return "IN_STOCK";
  if (status === ProductStatus.BACKORDERED) return "BACKORDERED";
  return "OUT_OF_STOCK";
}

export function statusChipClass(status: ProductStatus): string {
  if (status === ProductStatus.LIMITED_RUN) return "bg-primary text-on-primary";
  if (status === ProductStatus.IN_STOCK) return "bg-surface-tint text-on-primary";
  if (status === ProductStatus.BACKORDERED) return "bg-secondary text-on-primary";
  return "bg-outline text-on-primary";
}

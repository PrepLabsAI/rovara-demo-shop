import { findProduct } from "./catalog";
export interface CartLine {
  productId: string;
  quantity: number;
}
export interface Totals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}
export function calculateTotals(lines: CartLine[], taxRate = 0.0825): Totals {
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1)
    throw new Error("Invalid tax rate");
  if (!Array.isArray(lines) || lines.length > 100)
    throw new Error("Cart is too large");
  let subtotalCents = 0;
  let taxCents = 0;
  for (const line of lines) {
    if (
      !line ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 99
    ) {
      throw new Error("Quantity must be between 1 and 99");
    }
    const product = findProduct(line.productId);
    subtotalCents += product.priceCents * line.quantity;
    taxCents += Math.round(product.priceCents * taxRate) * line.quantity;
  }
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

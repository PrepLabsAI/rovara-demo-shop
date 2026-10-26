export interface CartLine {
  productId: string;
  quantity: number;
}
export function addToCart(lines: CartLine[], productId: string): CartLine[] {
  const found = lines.find((line) => line.productId === productId);
  if (!found) return [...lines, { productId, quantity: 1 }];
  return lines.map((line) =>
    line.productId === productId
      ? { ...line, quantity: Math.min(99, line.quantity + 1) }
      : line,
  );
}
export function removeFromCart(
  lines: CartLine[],
  productId: string,
): CartLine[] {
  return lines.filter((line) => line.productId !== productId);
}
export function countCart(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
export function money(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

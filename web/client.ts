export interface Product {
  id: string;
  name: string;
  priceCents: number;
  category: string;
}
export interface Totals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");
  if (!response.ok) throw new Error("Could not load products");
  return response.json();
}
export async function checkout(
  lines: { productId: string; quantity: number }[],
): Promise<Totals> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines }),
  });
  if (!response.ok) throw new Error("Could not calculate totals");
  return response.json();
}

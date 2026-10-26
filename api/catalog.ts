export interface Product {
  id: string;
  name: string;
  priceCents: number;
  category: string;
}
export const products: readonly Product[] = [
  {
    id: "notebook",
    name: "Field notebook",
    priceCents: 1200,
    category: "stationery",
  },
  {
    id: "pencil",
    name: "Graphite pencil",
    priceCents: 150,
    category: "stationery",
  },
  { id: "mug", name: "Studio mug", priceCents: 1800, category: "home" },
];
export function findProduct(id: string): Product {
  const p = products.find((p) => p.id === id);
  if (!p) throw new Error(`Unknown product: ${id}`);
  return p;
}

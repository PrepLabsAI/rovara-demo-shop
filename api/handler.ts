import { products } from "./catalog";
import { calculateTotals, type CartLine } from "./totals";
export interface ApiResponse {
  status: number;
  body: unknown;
}
export function handle(
  method: string,
  path: string,
  body?: unknown,
  query?: URLSearchParams,
): ApiResponse {
  if (method === "GET" && path === "/api/products") {
    const cat = query?.get("category") ?? null;
    const result = cat ? products.filter((p) => p.category === cat) : products;
    return { status: 200, body: result };
  }
  if (method === "POST" && path === "/api/checkout") {
    try {
      if (
        !body ||
        typeof body !== "object" ||
        !("lines" in body) ||
        !Array.isArray(body.lines)
      ) {
        throw new Error("Expected cart lines");
      }
      return { status: 200, body: calculateTotals(body.lines as CartLine[]) };
    } catch (error) {
      return { status: 400, body: { error: (error as Error).message } };
    }
  }
  return { status: 404, body: { error: "Not found" } };
}

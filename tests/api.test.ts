import { describe, expect, it } from "vitest";
// Note: the no-param / all-3-products case is already covered by the
// existing 'serves catalog and rejects unknown routes' test; it is not repeated.
import { handle } from "../api/handler";
import { calculateTotals } from "../api/totals";
import { findProduct } from "../api/catalog";
describe("catalog and checkout", () => {
  it("serves catalog and rejects unknown routes", () => {
    expect(handle("GET", "/api/products").status).toBe(200);
    expect(handle("GET", "/api/products").body).toHaveLength(3);
    expect(handle("DELETE", "/api/products").status).toBe(404);
    expect(() => findProduct("missing")).toThrow("Unknown product");
  });
  it("calculates a single-item total and an empty cart", () => {
    expect(calculateTotals([{ productId: "notebook", quantity: 1 }])).toEqual({
      subtotalCents: 1200,
      taxCents: 99,
      totalCents: 1299,
    });
    expect(calculateTotals([])).toEqual({
      subtotalCents: 0,
      taxCents: 0,
      totalCents: 0,
    });
    expect(
      calculateTotals([{ productId: "mug", quantity: 1 }], 0).totalCents,
    ).toBe(1800);
    expect(handle("POST", "/api/checkout", { lines: [] }).status).toBe(200);
  });
  it.each([0, -1, 100, 1.5, NaN])("rejects invalid quantity %j", (quantity) => {
    expect(
      handle("POST", "/api/checkout", {
        lines: [{ productId: "mug", quantity }],
      }).status,
    ).toBe(400);
  });
  it("rejects malformed cart, unknown products and invalid rates", () => {
    for (const body of [
      undefined,
      {},
      { lines: "x" },
      { lines: [null] },
      { lines: [{ productId: "oops", quantity: 1 }] },
    ])
      expect(handle("POST", "/api/checkout", body).status).toBe(400);
    for (const rate of [-1, 2, NaN])
      expect(() => calculateTotals([], rate)).toThrow("tax");
    expect(() =>
      calculateTotals(
        Array.from({ length: 101 }, () => ({ productId: "mug", quantity: 1 })),
      ),
    ).toThrow("large");
  });
});

describe("GET /api/products category filter", () => {
  function qs(s: string) {
    return new URLSearchParams(s);
  }

  it("known category stationery returns 2 items", () => {
    const r = handle("GET", "/api/products", undefined, qs("category=stationery"));
    expect(r.status).toBe(200);
    const body = r.body as { category: string }[];
    expect(body).toHaveLength(2);
    expect(body.every((p) => p.category === "stationery")).toBe(true);
  });

  it("known category home returns 1 item", () => {
    const r = handle("GET", "/api/products", undefined, qs("category=home"));
    expect((r.body as unknown[]).length).toBe(1);
  });

  it("unknown category returns empty list with 200", () => {
    const r = handle("GET", "/api/products", undefined, qs("category=food"));
    expect(r.status).toBe(200);
    expect(r.body).toEqual([]);
  });

  it("empty string category returns empty list", () => {
    const r = handle("GET", "/api/products", undefined, qs("category="));
    expect(r.status).toBe(200);
    expect(r.body).toEqual([]);
  });

  it("padded category ' stationery' returns empty list", () => {
    // URLSearchParams decodes '+' as a space, exercising the no-trim rule.
    const r = handle("GET", "/api/products", undefined, qs("category=+stationery"));
    expect(r.body).toEqual([]);
  });
});

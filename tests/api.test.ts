import { describe, expect, it } from "vitest";
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

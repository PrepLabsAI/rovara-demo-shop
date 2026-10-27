import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App } from "../web/App";
import { addToCart, removeFromCart, countCart, money } from "../web/cart";
import { checkout, fetchProducts } from "../web/client";
const catalog = [
  {
    id: "notebook",
    name: "Field notebook",
    priceCents: 1200,
    category: "stationery",
  },
];
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("keeps cart updates immutable and caps quantity", () => {
  const a = addToCart([], "notebook");
  const b = addToCart(a, "notebook");
  expect(a[0].quantity).toBe(1);
  expect(countCart(b)).toBe(2);
  expect(
    addToCart(
      [
        { productId: "a", quantity: 99 },
        { productId: "b", quantity: 2 },
      ],
      "a",
    ),
  ).toEqual([
    { productId: "a", quantity: 99 },
    { productId: "b", quantity: 2 },
  ]);
  expect(removeFromCart(b, "notebook")).toEqual([]);
  expect(money(1200)).toBe("$12.00");
});
it("adds, calculates and removes items through the screen", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => catalog })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subtotalCents: 1200,
          taxCents: 99,
          totalCents: 1299,
        }),
      }),
  );
  render(<App />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading");
  expect(
    screen.getByRole("button", { name: "Calculate totals" }),
  ).toBeDisabled();
  fireEvent.click(
    await screen.findByRole("button", { name: "Add Field notebook" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Calculate totals" }));
  expect(await screen.findByText("$12.99")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Remove notebook" }));
  expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  expect(screen.queryByText("$12.99")).not.toBeInTheDocument();
});
it("shows load errors", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  render(<App />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not load products",
  );
});
it("shows checkout errors and re-enables the button", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => catalog })
      .mockResolvedValueOnce({ ok: false }),
  );
  render(<App />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Add Field notebook" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Calculate totals" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not calculate totals",
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Calculate totals" }),
    ).toBeEnabled(),
  );
});
it("filters products by category", async () => {
  const multi = [
    { id: "notebook", name: "Field notebook", priceCents: 1200, category: "stationery" },
    { id: "mug",      name: "Studio mug",     priceCents: 1800, category: "home" },
  ];
  vi.stubGlobal("fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => multi }));
  render(<App />);
  await screen.findByRole("button", { name: "Add Field notebook" });

  fireEvent.click(screen.getByRole("button", { name: "home" }));
  expect(screen.queryByText("Field notebook")).not.toBeInTheDocument();
  expect(screen.getByText("Studio mug")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "All" }));
  expect(screen.getByText("Field notebook")).toBeInTheDocument();
});
it("client posts cart lines and surfaces errors", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ totalCents: 1299 }) });
  vi.stubGlobal("fetch", fetcher);
  expect(await checkout([{ productId: "notebook", quantity: 1 }])).toEqual({
    totalCents: 1299,
  });
  expect(fetcher).toHaveBeenCalledWith(
    "/api/checkout",
    expect.objectContaining({
      method: "POST",
      body: '{"lines":[{"productId":"notebook","quantity":1}]}',
    }),
  );
  fetcher.mockResolvedValue({ ok: false });
  await expect(fetchProducts()).rejects.toThrow("load");
  await expect(checkout([])).rejects.toThrow("totals");
});

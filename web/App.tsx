import { useEffect, useState } from "react";
import {
  addToCart,
  countCart,
  money,
  removeFromCart,
  type CartLine,
} from "./cart";
import { checkout, fetchProducts, type Product, type Totals } from "./client";
export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((p) => {
        if (!cancelled) setProducts(p);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  function update(next: CartLine[]) {
    setLines(next);
    setTotals(null);
    setError("");
  }
  async function calculate() {
    setBusy(true);
    setError("");
    try {
      setTotals(await checkout(lines));
    } catch {
      setError("Could not calculate totals");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main>
      <header>
        <p>Sample goods for everyday work</p>
        <h1>Field Supply</h1>
      </header>
      {loading && <p role="status">Loading products…</p>}
      {error && <p role="alert">{error}</p>}
      <section aria-label="Products">
        {products.map((p) => (
          <article key={p.id}>
            <h2>{p.name}</h2>
            <p>{p.category}</p>
            <p>{money(p.priceCents)}</p>
            <button
              disabled={busy}
              onClick={() => update(addToCart(lines, p.id))}
            >
              Add {p.name}
            </button>
          </article>
        ))}
      </section>
      <section aria-label="Cart">
        <h2>Cart ({countCart(lines)})</h2>
        {!lines.length && <p>Your cart is empty.</p>}
        <ul>
          {lines.map((line) => (
            <li key={line.productId}>
              {products.find((p) => p.id === line.productId)?.name} ×{" "}
              {line.quantity}
              <button
                disabled={busy}
                onClick={() => update(removeFromCart(lines, line.productId))}
              >
                Remove {line.productId}
              </button>
            </li>
          ))}
        </ul>
        <button disabled={!lines.length || busy} onClick={calculate}>
          {busy ? "Calculating…" : "Calculate totals"}
        </button>
        {totals && (
          <dl>
            <dt>Subtotal</dt>
            <dd>{money(totals.subtotalCents)}</dd>
            <dt>Tax</dt>
            <dd>{money(totals.taxCents)}</dd>
            <dt>Total</dt>
            <dd>{money(totals.totalCents)}</dd>
          </dl>
        )}
      </section>
    </main>
  );
}

# Field Supply

Small two-part shop: a Node 22 TypeScript JSON API and React/Vite frontend.
All products are fictional. Checkout calculates a quote; no payment, account,
shipping, order submission or external services are involved.

## Run

`npm ci`. In one terminal run `npm start` (API on loopback port 3001),
and in another `npm run dev` (Vite on loopback port 5173). Vite proxies `/api`.
`npm run build` creates frontend assets; serve them with an API proxy for production.

## Contracts

GET `/api/products` returns an array of `id`, `name`, `priceCents`, `category`.
POST `/api/checkout` accepts `{ "lines": [{ "productId": "notebook", "quantity": 1 }] }`
and returns `subtotalCents`, `taxCents`, `totalCents`. Invalid carts return 400;
unknown routes return 404. Quantities are integers 1–99 and at most 100 lines.
The server owns product prices. USD tax is 8.25%; the business policy is to
round tax once on the complete subtotal, to the nearest cent.

## Development

`npm run lint` runs ESLint and TypeScript; `npm test` runs API and DOM tests
with coverage. CI uses the same commands. `npm run build` checks the Vite bundle.
Frontend work belongs in `web/`, backend work in `api/`; contracts are repeated
in the client to keep these independently editable in this small fixture.
TODO generate client types if the API grows. Cart contents are in memory only.
MIT licensed.

CI verification: documentation-only check.

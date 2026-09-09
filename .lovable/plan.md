# Public price page, cart, and price-list rules

Three pieces of work: a public price page that gives an instant price idea, a cart so one customer can collect several products into one enquiry, and a rule on every price-list row that says how much of that material a door uses.

## 1. Public price page (the new home page)

Opens prefilled at 2000 x 2000 mm, so a visitor sees a price before touching anything.

Two cards side by side, Synego Slide and Synego HST. Each card shows:

- One large price: white, standard glass, including VAT
- Two smaller prices below: anthracite outside / white inside, anthracite both sides
- Estimated installation price and an indicative delivery time
- Opt-in extras, each with its own price, updating the totals live:
  - Lock 250
  - Extended warranty 150 / year
  - Safety glass 350
  - Solar glass 200
  - Extra gasket 150
- An "I want it" button

Width and height inputs sit in a shared panel (1500-4500 x 1500-2400). Invalid sizes show a plain message instead of a price.

HST threshold rail is chosen automatically from the width and never shown as a choice:

```text
up to 2500 mm  -> 600
2501-3000 mm   -> 750
3001-3700 mm   -> 900
over 3700 mm   -> HST shows "price on request", Slide still priced
```

Nothing on this page reveals material cost, labour, markup, margin or a cost breakdown. Same for every sales-facing screen: only final prices.

"I want it" carries size, system, colour and chosen extras into the enquiry form, which starts prefilled.

## 2. Cart and continued shopping

The enquiry form keeps its steps but ends with "Add to cart" instead of finishing:

- Customer details entered once: one-time customer or a simple saved-in-this-browser account
- Per product: colours, glazing, extras, active side, quantity, notes
- Delivery address and notes belong to the whole cart, not each product
- Cart page lists products with prices, edit and remove, running total with VAT, and "Add another product"
- Sending the cart produces one offer number and shows the confirmation page
- Cart, offers and orders stay in this browser for now; nothing is saved on a server yet

Two quiet helpers on the price page and in the cart: "Call me back" (name + phone) and "Chat with a pro", which for now opens a short contact panel and is marked as the future AI assistant.

Since the cart holds a list of products rather than sliding doors only, the product model is widened now so other window types can be added later without redoing the cart.

## 3. Price-list rows: how a material is counted

Every row gains two fields:

- Counted as: one piece / per metre of frame / per metre of sash / per metre of mullion / per square metre of glass / fixed quantity
- Applies to: Slide, HST, or both, with an optional different price per system

Adding a row therefore never needs code: you pick the rule, the quantity at the reference door, and the price, and the calculator scales it with door size. The admin edit panel gets these two fields with plain-language labels and a live "at the reference door this costs X" line so a wrong rule is obvious immediately.

## Technical section

- `src/lib/pricing.ts`: replace `suggestThreshold` usage with a width-derived `thresholdForWidth` (600/750/900, `null` above 3700); `calculateQuote` returns `null`-threshold state so HST can render "price on request". Keep the reference calibration and tests; extend `pricing.test.ts` for the new bands.
- New `src/lib/public-price.ts`: given size + system + finish + extras, returns only `{ productGross, extras[], installationEstimate, deliveryWeeks }`. No cost fields exist on the returned shape, so customer components cannot leak them.
- New `src/lib/extras.ts`: extras catalogue (id, label, gross price, per-year flag, whether it replaces the glass package).
- `src/routes/index.tsx` becomes the price page; the current landing content folds into it. `/admin/calculator` stays unchanged and admin-only.
- Cart: extend `src/mock/store.tsx` with `cart: CartItem[]`, add/update/remove, `customer`, and `submitCart()` creating an enquiry + offer. Persist to `localStorage` behind a `typeof window` guard. New `src/routes/cart.tsx`.
- Types: introduce `ProductKind = "slidingDoor"` with `CartItem = { id, kind, config, extras, qty }` so future window types slot in.
- `PriceItem` gains `driver: Driver`, `refQty`, `systems: SystemId[]`, `unitPriceBySystem`; `src/mock/data.ts` rows filled from the existing cost lines so the admin table and the calculator read one source.
- Each new route gets its own `head()`; `/cart` and `/enquiry` noindex, the price page fully indexed with its own title and description.

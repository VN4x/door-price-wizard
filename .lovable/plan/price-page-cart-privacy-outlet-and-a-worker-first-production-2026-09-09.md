# Price page, cart, privacy, Outlet and a worker-first production sheet

Six pieces: an instant-price home page, a cart for several products, strict separation between customers and your own staff, an Outlet of stock products, a production sheet built for the workshop, and a rule on every price-list row saying how much of that material a door uses.

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
- Per product: system (Slide or HST), colours, glazing, extras, active side, quantity, notes
- Delivery address and notes belong to the whole cart, not each product
- Cart page lists products with prices, edit and remove, running total with VAT, and "Add another product"
- Sending the cart produces one offer number, emails the offer to the customer automatically, and shows the confirmation page with a link to their own offer
- Two quiet helpers: "Call me back" (name + phone) and "Chat with a pro", which opens a short contact panel for now and is marked as the future AI assistant
- The product model is widened now so other window types can be added later without redoing the cart

## 3. Privacy: customers see only their own things

The public site and your internal site become two clearly separated worlds:

- Public pages: price page, Outlet, enquiry, cart, and one offer opened by its own private link. Nothing else.
- No list of customers, enquiries, offers, orders, production sheets or staff screens is reachable from the public side, and no such list is even loaded there.
- An offer link only opens that one offer, using a long random token, not a guessable number.
- Staff screens (dashboard, enquiries, offers, orders, production, glass, price list, calculator) move behind a real sign-in with two roles, sales and owner. Costs, margins and the price list stay owner-only.
- Until sign-in exists this stays honest rather than pretend: the demo role switch is removed from public pages, and I will tell you plainly which screens still need the login step before you publish.

Real logins and per-customer data separation need a backend with accounts. Say the word and I set that up in this phase; otherwise this step ships as separation of pages and data, with the login added next.

## 4. Outlet

New menu item "Outlet" for customers: products already in stock, each with size, colour, glazing, a photo placeholder, a stock count and a price, plus "Add to cart". Sold-out items show as reserved.

"Sample offer" stays, but as our own internal example, kept off the public menu, and it can hold several products so it shows a realistic collection.

## 5. Production sheet built for the workshop

The current sheet spends its space on the picture and a description column that says nothing. Reversed:

- Order number, customer name, system (SLIDE or HST) and quantity in very large type at the top
- The description column is removed; article name and cut length become the prominent columns, with a pieces column added next to metres
- Glass gets its own block: each glass unit listed with its width x height and piece count, in large type, because an order usually has several different glass sizes
- Screws and small parts stay in a small, quiet block at the bottom
- The door illustration shrinks to a small reference thumbnail, with the system name labelled on it, since the shape rarely changes between orders
- Slide and HST have different production dimensions, so the chosen system is recorded on every product from the enquiry onwards and drives both the deductions and the label on the drawing

## 6. Price-list rows: how a material is counted

Every row gains two fields:

- Counted as: one piece / per metre of frame / per metre of sash / per metre of mullion / per square metre of glass / fixed quantity
- Applies to: Slide, HST, or both, with an optional different price per system

Adding a row therefore never needs code: you pick the rule, the quantity at the reference door and the price, and the calculator scales it with door size. The edit panel gets both fields with plain labels and a live "at the reference door this costs X" line, so a wrong rule is obvious at once.

## Technical section

- `src/lib/pricing.ts`: width-derived `thresholdForWidth` (600/750/900, `null` above 3700) replacing the manual `suggestThreshold` choice; `calculateQuote` reports the unavailable-threshold state so HST can render "price on request". Reference calibration and `pricing.test.ts` kept and extended for the bands.
- New `src/lib/public-price.ts`: size + system + finish + extras in, only `{ productGross, extras[], installationEstimate, deliveryWeeks }` out. No cost field exists on the returned shape, so a customer component cannot leak one.
- New `src/lib/extras.ts`: extras catalogue (id, label, gross price, per-year flag, glass-package replacement flag).
- New `src/lib/production.ts`: per-system production dimensions and glass deductions (`SLIDE` vs `HST` tables), consumed by `glass.ts` and the production route.
- `src/routes/index.tsx` becomes the price page. New `src/routes/outlet.tsx`, `src/routes/cart.tsx`. `/offer/$offerId` becomes `/offer/$token` with a random token in mock data.
- Route split for privacy: staff routes stay under `src/routes/admin.*`; the demo role switch (`DemoBar`) is limited to admin routes only, and public routes read from a separate customer-scoped slice of the store that contains no other customer's records.
- Cart: extend `src/mock/store.tsx` with `cart: CartItem[]`, add/update/remove, `customer`, and `submitCart()` creating enquiry + offer + auto-send timestamp. Persist to `localStorage` behind a `typeof window` guard, in one idempotent bootstrap path.
- Types: `ProductKind = "slidingDoor"`, `CartItem = { id, kind, config, extras, qty }`, `OutletItem`, `Offer.token`, `Offer.autoSentAt`.
- `PriceItem` gains `driver: Driver`, `refQty`, `systems: SystemId[]`, `unitPriceBySystem`; `src/mock/data.ts` rows derive from the existing cost lines so the admin table and the calculator share one source.
- Production route: `materialsFor` returns `{ name, cutLengthM, pieces, unit }`, drops the group description, and glass units come from `glassUnitsForLine` grouped by size with counts. `DoorDrawing` gains a `compact` mode and a system label.
- Each route gets its own `head()`; `/cart`, `/enquiry`, `/offer/$token` and all admin routes noindex; price page and Outlet indexed with their own titles and descriptions.
- Automatic offer email: with a backend this is a real send on cart submit; without one it is recorded as sent and shown in the offer's history, and I will say so rather than imply mail is leaving.

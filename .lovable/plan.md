# Finishing the customer flow and the price list logic

The instant price page, basket, offer link, Outlet and the worker sheet are now working. This plan closes the remaining points from your list: the rail lengths, the customer journey details, and how a new price list row gets attached to a product.

## 1. Threshold rails (already in place, confirming the rule)

The rail is charged as a whole piece, HST only, chosen from the door width:

- up to 2500 mm: 2.5 m rail, 600 EUR
- 2501-3000 mm: 3.0 m rail, 750 EUR
- 3001-3700 mm: 3.7 m rail, 900 EUR
- wider than 3700 mm: price on request, no automatic price shown

Nothing about rails is shown or chosen by the customer. Synego Slide never gets a rail.

## 2. Glass affects the price

Today the glass package is chosen in the configurator but does not change the price. Add a clear surcharge per package on top of the standard glass price, shown on both the price page and the basket:

- Standard 2-glass: included
- Warm 3-glass: surcharge
- Quiet 3-glass: surcharge
- Toughened / laminated safety: surcharge

I will start with placeholder figures and you replace them with your real ones in one screen. The extras list (lock, extended warranty, safety glass, solar glass, extra gasket) stays as agreed.

## 3. Customer journey polish

- Price page stays the entry point: prefilled 2000 x 2000, big white price, smaller anthracite prices, options with tick boxes, estimated fitting and delivery time, "I want it" on both systems.
- Configurator: keeps everything carried over from the price page, then "Add to basket" plus "Add and keep shopping" so several doors and Outlet items can go on one offer.
- Details step: choose "One-time customer" or "Create an account to follow my offers" (account is a name and password kept on this device for now, not a real login yet).
- Offer number and order number are shown on the confirmation screen and in the emailed offer.
- "Call me back" and "Chat with a pro" stay on every customer screen; the chat is a simple message box that records the request until a real assistant is connected.

## 4. How a new price list row attaches to a product

Every row already carries three fields, and the add/edit panel will make them the main choices:

- Counted as: whole door frame length, sash length, mullion height, door width, glass area, or a fixed number of pieces
- Quantity at the reference door (3500 x 2178 mm): the amount used on that door, from which every other size is scaled
- Used by: Slide, HST, or both, with an optional different purchase price for HST

So adding a row is three answers: how it is counted, how much of it the reference door uses, and which systems use it. That is enough for every article in your two sheets. My suggestion: keep your current sheet as it is; you do not need to rewrite it. If you later want per-article waste allowances or supplier codes, we add those two columns then.

## 5. Still mock data

Everything lives in the browser for now. Real accounts, real emailed offers, server-held prices and proper separation between customers and staff come in the next phase, before this goes on kvaliteetaken.ee.

## Technical notes

- Glazing surcharges: add a table in `src/lib/glass.ts`, feed it through `publicPrice` in `src/lib/public-price.ts` and the cart line total, and expose it in the admin price screen.
- Configurator: add a second submit action that returns to the price page with the basket kept.
- Details step: extend `CustomerDetails` with an account flag and a locally stored profile in `src/mock/store.tsx`.
- Price list editor: turn `driver`, `refQty` and `systems` into labelled selects with plain-language help text in `src/routes/admin.price-list.tsx`.

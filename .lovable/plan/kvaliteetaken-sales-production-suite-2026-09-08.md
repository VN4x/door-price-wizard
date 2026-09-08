# Kvaliteetaken sales & production suite

Your calculator becomes the engine; around it we build six screens with mock data only, desktop-first and tablet-friendly. Real costs live only behind admin screens and the "Show calculation" disclosure — never on customer-facing pages.

## What I take, what I change, what I ditch

Take as described:

- Public enquiry page (step-by-step, live preview, no internal prices)
- Customer offer page (premium, print, accept)
- Admin dashboard with sidebar, summary cards, status chips, simple pipeline list
- Offer editor with hidden calculation and side-by-side customer preview
- Production order screen (print-first, huge dimensions, active-side badge, drawing, materials table)
- Glass order view with .txt download
- Price list management with search + edit panel

Changes I recommend:

- Cost secrecy is a real permission, not just hidden UI. In this mock phase I use a single "role" switch (Customer / Sales / Admin) so you can see exactly what each person sees. When we later add real logins, costs move to the server and never reach a salesperson's browser at all. Anything hidden only by CSS is readable by a curious salesperson.
- Glazing: 3–4 named packages (standard 2-glass, 3-glass warm, sound 35 dB, safety) rather than free specification. Faster for customers, and your pricing sheet only has one glass line today.
- Quantity: one enquiry can hold several door lines instead of a single quantity field — most HST enquiries are 2–3 openings.
- Offer number / validity: auto format KA-2026-0142, 30 days validity, shown on offer and production order.
- Product type "Siegenia HST" is hardware, and your price sheet is Rehau Synego Slide / HST. I keep the profile system as the product (Synego Slide / Synego HST) and mention Siegenia hardware as a spec line.

Ditch or defer:

- Users and Settings pages: sidebar entries only, real screens once logins exist.
- Orders / Production as separate full modules: one pipeline list with status chips covers it now; a full production module comes after you use it for a week.
- Charts and analytics — the pipeline list is more useful.
- Article photos, BOM lengths for the customer, complex drag-and-drop drawing editor.

## My own additions worth having

- Offer share link with a token so the customer opens their offer without a login, and you see "viewed 2 days ago".
- Duplicate & revise: any offer becomes v2 in one click, old version stays for history.
- Margin guard in the offer editor: a quiet indicator (green / amber / red) showing margin % after the salesperson edits the price, plus a floor below which a discount needs your approval. This is the single most valuable feature for protecting your money without exposing costs.
- Copy-paste enquiry summary for phone calls, and a "same as last order" prefill.
- Glass order text file per supplier format, plus an "order sheet already sent" timestamp so nothing is ordered twice.
- Production order QR code that opens the same order on a phone in the workshop.
- Estonian / English language toggle; the customer pages default to Estonian.
- Print stylesheets tuned to A4 for the offer, the production order and the glass sheet.

## Build order

1. Foundations: role switch, layout shells, design tokens, status chip and print styles.
2. Public enquiry flow + live preview + confirmation screen.
3. Customer offer page (print, accept, share look).
4. Admin dashboard + pipeline.
5. Offer editor with hidden calculation and margin guard.
6. Production order + technical drawing + materials table.
7. Glass order view + .txt export.
8. Price list management.

## Technical section

- Stack stays TanStack Start, Tailwind v4 tokens in `src/styles.css`, shadcn components. No backend in this phase.
- Routes: `/enquiry`, `/enquiry/sent`, `/offer/$offerId`, `/admin`, `/admin/enquiries`, `/admin/offers`, `/admin/offers/$offerId`, `/admin/orders`, `/admin/orders/$orderId/production`, `/admin/orders/$orderId/glass`, `/admin/price-list`. `/` becomes the marketing-ish entry that links to the enquiry form; the current calculator moves to `/admin/calculator`.
- Layout routes: `src/routes/admin.tsx` renders the sidebar + top bar around `<Outlet />`; customer routes stay chrome-light.
- Mock data in `src/mock/` (enquiries, offers, orders, price items, articles) with typed models in `src/types/`. A `useMockStore` context holds mutations in memory so status changes and edits persist while clicking around.
- Pricing reuses `src/lib/pricing.ts` unchanged. New `src/lib/offer.ts` derives customer-facing figures (product total, delivery, installation, VAT, grand total) and returns cost fields only when the caller passes an admin role, so a customer render path has no cost numbers in it.
- Drawing: a pure SVG component `src/components/DoorDrawing.tsx` taking width, height, panel count, active side, and rendering dimension lines plus per-panel glass sizes. Same component in small size for the live preview, large for production print.
- Glass sizes come from a `src/lib/glass.ts` helper deriving panel glass width/height from overall size and profile deductions (constants file, editable).
- `.txt` export built client-side via a Blob download, one line per glass unit.
- Print: `@media print` rules per document class, page-break control, hidden nav.
- Every route gets its own `head()` metadata; admin routes get `robots: noindex`.
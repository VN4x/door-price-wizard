&nbsp;

# Sliding Door Quick Price Calculator

A single-page web calculator (built in Lovable, no spreadsheet) where a dealer enters a width and height, picks a colour finish, and immediately sees an offer price for both Rehau Synego Slide and Rehau Synego HST side by side.

## Do the files give enough logic? Yes, with one addition

- The material cost file gives a complete, priced bill of materials for one exact size (3500 x 2178 mm, half opening): white Slide 1770 material + 400 labour = 2170; white HST 2612 material + 600 labour = 3212.
- The price list gives the three-tier finish pricing per profile family (white / white inside + laminated outside / laminated both sides), so colour uplift is real data, not a guess.
- What the files do NOT contain is how each quantity changes with size. So the calculator keeps your exact cost lines and prices, and scales each line's quantity by the dimension that physically drives it. At 3500 x 2178 it reproduces your numbers exactly; at other sizes it scales sensibly.

## What the dealer sees

- Width input: 1500-4500 mm. Height input: 1500-2400 mm. Out-of-range values are blocked with a clear message.
- Finish: White / White inside, coloured outside / Coloured both sides.
- Threshold (HST only): 2.5 m = 600, 3.0 m = 750, 3.7 m = 900 EUR delivered. Auto-suggested from the width, dealer can override.
- Two result cards, Slide and HST, each showing material cost, labour, subtotal, markup, VAT and the final offer price. One system is toggled as "selected" for the printed summary, both stay visible for comparison.
- An expandable cost breakdown per system (profiles, reinforcement, rails, seals, glass, hardware, threshold) so the dealer can sanity-check, plus a print/copy summary. No BOM lengths, no manufacturing dimensions.

## Pricing rules being applied

- Labour: flat 400 (Slide) / 600 (HST), unchanged by size.
- Markup: editable field, default 25%.
- VAT: 22%, shown as its own line on top of the marked-up price.
- HST keeps the mullion profile and its reinforcement exactly as in your sheet, and HST also carries the threshold. The 2 EUR/m HST frame price is corrected to 20 EUR/m.
- Slide keeps one sash (raam); HST keeps two (raam + raam2).

## Technical section

Data model: a `PRODUCTS` table in TypeScript with one row per cost line, each holding the white unit price, the reference quantity from your sheet, a `driver`, and a `finishFamily`.

Quantity drivers, calibrated so W=3.5 / H=2.178 returns the reference quantity:

- `framePerimeter` = 2(W+H), ref 11.356 — leng, Raud LENG, kate, kate2, raami tihend
- `sashPerimeter` = W + 2H, ref 7.856 — raam, raam2, Raud RAAM, Raud RAAM2, klaasiliist, klaasitihend
- `height` = H, ref 2.178 — post, Raud Post
- `width` = W, ref 3.5 — Siinid üla ja ala
- `glassArea` = W x H x 0.8643, ref 6.5884 m2 — glass unit
- `fixed` — handle, jupid, screws, clamps, connectors, bridges, keeper holders

Finish multipliers derived from the price list (white -> one side -> both sides):

- Sash family (Flügel 8.85 / 11.37 / 13.05): 1.000 / 1.285 / 1.475
- Frame family (Zarge 8.48 / 10.59 / 12.27): 1.000 / 1.249 / 1.447
- Bead family / kate, kate2 (Zargenleiste 3.31 / 5.40 / 7.09): 1.000 / 1.631 / 2.141
- Mullion family (Sprosse 96 7.36 / 11.00 / 14.00): 1.000 / 1.495 / 1.902
- Steel, rails, seals, glass, hardware, threshold: 1.000 (no finish effect)

Implementation: TanStack Start route at `/` replacing the placeholder, calculation in a pure `src/lib/pricing.ts` module (unit-testable, reference-size assertions), plus a `pricing.test.ts` verifying the 3500 x 2178 white case returns 1770 / 2612 material and 2170 / 3212 with labour. No backend, no database — pure client-side math, so prices are editable by changing one constants file later.

Desing it to be implementable i to [kvaliteetaken.ee](http://kvaliteetaken.ee) inquiry site

&nbsp;
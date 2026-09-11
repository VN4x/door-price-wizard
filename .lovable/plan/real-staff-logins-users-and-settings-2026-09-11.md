# Real staff logins, Users and Settings

Two new admin screens, plus the real login system behind them. Staff sign in with their own email and password, and a new account only works after you approve it. The price list and the business settings move into the real database so edits are saved for everyone, not just in one browser.

## Sign in and approval

- New sign-in page for staff. Registration is possible, but a new staff account starts as "waiting for approval" and can see nothing until you approve it. Customers registration is open for everyone with separate rights to see their own related and input only.
- You (owner) see pending requests on the staff Users screen and approve, set a role, or reject.
- Roles: owner, sales, production. Costs, purchase prices, margins and the price list stay owner-only, enforced by the database itself — not just hidden in the screen.
- Customer pages (price page, Slide or HST, outlet, configurator, cart, private offer link) stay open to everyone with no login. optionally enable  save and access if customer  is registered 
- Signing out clears everything and returns to the sign-in page; the header shows who is signed in.

## Users screen (owner only)

- Table: name, email, role, status (pending, active, disabled), invited/joined date, last activity.
- Pending requests highlighted at the top with Approve / Reject.
- Side panel to change role, disable or re-enable a person.
- Owner cannot remove or demote their own last owner account.

## Settings screen (owner only)

Grouped sections, each saved to the database:

- Company: name, registry code, VAT number, address, phone, email, website, logo placeholder — used on offers and production sheets.
- Offers: offer validity days, VAT rate, offer and order number prefixes, default language.
- Estimates: delivery estimate rate, fitting estimate rate, delivery time text shown on the price page.
- Money rules: default markup, minimum margin floor (blocks sending below it), campaign discount percentage and reason — moved here from the price list screen.
- Email: subject and body wording used when an offer is sent.

## Price list becomes real CRUD

- Articles, customer add-ons and glass prices are stored in the database with full add / edit / duplicate / deactivate, unit, quantity driver, applicable system, purchase price, multiplier, updated date and who changed it.
- Calculator, configurator and offers read live prices from the database instead of the built-in file, so a price change takes effect everywhere immediately.
- Existing prices are loaded in as the starting data so nothing changes on day one.

## What stays as it is

Enquiries, offers, orders, production and glass views keep their current behaviour and layout; they simply require a signed-in staff account now. sales person sees almost same data as cusomer but  will see also all offers and orders list, can edit dimensions (edits logged) etc spec of offer (ie after mesuring before production order, when status production sales cant change anything including not changing status back to pre-production offer/order.), can create invoices of offer and change offer status to order and after payments. online wise sepa payment does this automatically. production changs status according to production processes. including "ready" and "dlevered"

&nbsp;

ps regarding languages check out cpohere blog would this be helpful  
https://cohere.com/blog/north-small-translate

## Technical notes

- Enable Lovable Cloud. Tables: `profiles` (name, status, timestamps), `user_roles` (separate table, `app_role` enum, `has_role` security-definer function), `app_settings` (single row, owner-write), `price_items`, `addon_items`, `glass_items`. Every table gets explicit GRANTs, RLS enabled, and policies scoped through `has_role`.
- Signup trigger creates a profile with status `pending` and no role row; RLS on every staff table requires an active profile plus role, so a pending account reads nothing.
- Sensitive reads/writes (costs, margins, price list, settings, user administration) go through `createServerFn` with `requireSupabaseAuth` plus an in-handler role check; `supabaseAdmin` only for role grants and status changes.
- Staff routes move under `src/routes/_authenticated/`; public routes stay top-level with SSR and their own `head()` metadata.
- Public price/configurator reads use a server publishable client against narrow `TO anon` SELECT policies exposing only sale prices — never purchase prices or multipliers.
- Seed prices, settings defaults and the first owner grant ship as literal INSERTs in the migration.
- The browser mock store is retired for staff data; cart and language stay client-side.
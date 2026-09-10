import type { ExtraId } from "@/types";

export interface ExtraOption {
  id: ExtraId;
  label: string;
  hint: string;
  /** Customer price in EUR incl. VAT. */
  price: number;
  perYear?: boolean;
  /** Extras that change the glass package rather than add a part. */
  glassOption?: boolean;
}

export const EXTRAS: ExtraOption[] = [
  { id: "lock", label: "Security lock", hint: "Key-locking handle set", price: 250 },
  {
    id: "warranty",
    label: "Extended warranty",
    hint: "Each additional year beyond the standard warranty",
    price: 150,
    perYear: true,
  },
  // Safety and solar glass now live in the glass upgrades, priced per m², so they
  // are deliberately not repeated here.
  { id: "gasket", label: "Extra gasket", hint: "Third seal for wind-exposed openings", price: 150 },
];

export const EXTRA_BY_ID: Partial<Record<ExtraId, ExtraOption>> = EXTRAS.reduce(
  (acc, e) => ({ ...acc, [e.id]: e }),
  {} as Partial<Record<ExtraId, ExtraOption>>,
);

export function extrasTotal(ids: ExtraId[]): number {
  return ids.reduce((sum, id) => sum + (EXTRA_BY_ID[id]?.price ?? 0), 0);
}

export function extrasLabels(ids: ExtraId[]): string[] {
  return ids.map((id) => EXTRA_BY_ID[id]?.label ?? id);
}

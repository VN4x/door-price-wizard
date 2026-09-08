import { cn } from "@/lib/utils";
import type { OfferStatus, OrderStatus } from "@/types";

const TONES = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-primary/10 text-primary",
  warn: "bg-accent/15 text-accent",
  good: "bg-emerald-500/15 text-emerald-700",
  done: "bg-primary text-primary-foreground",
} as const;

type Tone = keyof typeof TONES;

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  order: { label: "Order", tone: "info" },
  drawingsPrinted: { label: "Drawings printed", tone: "neutral" },
  glassOrdered: { label: "Glass ordered", tone: "warn" },
  ready: { label: "Ready", tone: "good" },
  delivered: { label: "Delivered", tone: "done" },
};

export const OFFER_STATUS_META: Record<OfferStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Offer sent", tone: "info" },
  accepted: { label: "Accepted", tone: "good" },
  declined: { label: "Declined", tone: "warn" },
};

export function StatusChip({
  label,
  tone = "neutral",
  className,
  size = "sm",
}: {
  label: string;
  tone?: Tone;
  className?: string | undefined;
  size?: "sm" | "lg" | undefined;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-4 py-1.5 text-sm",
        TONES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function OrderStatusChip({ status, size }: { status: OrderStatus; size?: "sm" | "lg" }) {
  const meta = ORDER_STATUS_META[status];
  return <StatusChip label={meta.label} tone={meta.tone} size={size} />;
}

export function OfferStatusChip({ status, size }: { status: OfferStatus; size?: "sm" | "lg" }) {
  const meta = OFFER_STATUS_META[status];
  return <StatusChip label={meta.label} tone={meta.tone} size={size} />;
}

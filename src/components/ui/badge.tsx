import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, { className: string; symbol: string }> = {
  neutral: { className: "bg-mist text-ink", symbol: "•" },
  info: { className: "bg-sky-tint text-ink", symbol: "i" },
  success: { className: "bg-moss-tint text-moss", symbol: "✓" },
  warning: { className: "bg-flame-tint text-flame-deep", symbol: "!" },
  danger: { className: "bg-rhodo-tint text-rhodo", symbol: "×" },
};

/**
 * Status badge. Meaning is carried by the text label and a symbol, never by colour alone.
 */
export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-semibold whitespace-nowrap",
        t.className,
        className,
      )}
    >
      <span aria-hidden="true" className="text-xs leading-none">
        {t.symbol}
      </span>
      {children}
    </span>
  );
}

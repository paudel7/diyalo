import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertTone = "info" | "success" | "warning" | "danger";

const tones: Record<AlertTone, { box: string; symbol: string; role: "status" | "alert" }> = {
  info: { box: "border-ink/30 bg-sky-tint text-ink", symbol: "i", role: "status" },
  success: { box: "border-moss bg-moss-tint text-ink", symbol: "✓", role: "status" },
  warning: { box: "border-flame-deep bg-flame-tint text-ink", symbol: "!", role: "status" },
  danger: { box: "border-rhodo bg-rhodo-tint text-ink", symbol: "×", role: "alert" },
};

/** In-page message. Errors use role="alert"; the rest use role="status". */
export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div role={t.role} className={cn("flex gap-3 rounded-lg border-l-4 p-4", t.box, className)}>
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-snow"
      >
        {t.symbol}
      </span>
      <div className="text-base">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

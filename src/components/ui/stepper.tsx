import { cn } from "@/lib/cn";

export type StepState = "complete" | "current" | "upcoming";

export interface Step {
  label: string;
  state: StepState;
  note?: string;
}

const stateText: Record<StepState, string> = {
  complete: "Completed",
  current: "Current step",
  upcoming: "Not started",
};

/**
 * Ordered process indicator for sequences such as the 10-step case workflow (roadmap 5.2).
 * State is announced in text for screen readers and shown with a symbol, not colour alone.
 */
export function Stepper({
  steps,
  label,
  className,
  compact = false,
}: {
  steps: Step[];
  label: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <ol aria-label={label} className={cn("grid gap-3", compact ? "sm:grid-cols-2" : "", className)}>
      {steps.map((s, i) => (
        <li
          key={s.label}
          aria-current={s.state === "current" ? "step" : undefined}
          className="flex items-start gap-3"
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
              s.state === "complete" && "border-moss bg-moss text-white",
              s.state === "current" && "border-ink bg-flame text-ink",
              s.state === "upcoming" && "border-slate bg-paper text-slate",
            )}
          >
            {s.state === "complete" ? "✓" : i + 1}
          </span>
          <span className="block">
            <span className="block font-semibold">{s.label}</span>
            <span className="block text-sm text-slate">
              <span className="sr-only">{stateText[s.state]}. </span>
              {s.note}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

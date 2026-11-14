import { cn } from "@/lib/cn";
import { formatMoney, percentOf, type Money } from "@/lib/money";

/**
 * Funding progress. Per PUB-05 the real component must be fed confirmed, eligible donations
 * only; in Stage 1 it renders mock values. The figures are always shown as text as well as a bar.
 */
/** Progress in whole units (for example 18 of 40 supply packs funded). */
export function UnitProgress({
  done,
  total,
  label,
  unitLabel,
}: {
  done: number;
  total: number;
  label: string;
  unitLabel: string;
}) {
  const pct = percentOf(done, total);
  return (
    <div>
      <p className="text-base font-semibold">
        {done} of {total} <span className="font-normal text-slate">{unitLabel}</span>
      </p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${done} of ${total} ${unitLabel}`}
        className="mt-2 h-3 overflow-hidden rounded-full bg-mist"
      >
        <div className="h-full rounded-full bg-flame" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function FundingProgress({
  raised,
  target,
  label,
  className,
}: {
  raised: Money;
  target: Money;
  label: string;
  className?: string;
}) {
  const pct = percentOf(raised.minor, target.minor);
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-lg font-semibold">
          {formatMoney(raised)}{" "}
          <span className="font-normal text-slate">of {formatMoney(target)}</span>
        </p>
        <p className="text-sm font-semibold text-slate">{pct}%</p>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}% of target confirmed`}
        className="mt-2 h-3 overflow-hidden rounded-full bg-mist"
      >
        <div className={cn("h-full rounded-full bg-flame")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { Lamp } from "@/components/brand/lamp";

/** Empty state: says what is missing and offers the next action. */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-mist bg-paper px-6 py-10 text-center">
      <Lamp className="mx-auto h-16 w-16 opacity-80" />
      <h3 className="mt-3 text-xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-prose text-base text-slate">{children}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** Error state: names what went wrong and how to fix it. No apology, no vagueness. */
export function ErrorState({
  title,
  children,
  action,
  headingLevel = 3,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div role="alert" className="rounded-xl border-2 border-rhodo bg-rhodo-tint px-6 py-8">
      <Heading className="text-xl">{title}</Heading>
      <p className="mt-2 max-w-prose text-base">{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

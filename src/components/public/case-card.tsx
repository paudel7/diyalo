import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { FundingProgress } from "@/components/ui/progress";
import { getProgram } from "@/mocks/programs";
import type { PublicCase } from "@/mocks/types";

/** Case summary used in lists. Shows only fields from the PublicCase allowlist. */
export function CaseCard({ item, headingLevel = 3 }: { item: PublicCase; headingLevel?: 2 | 3 }) {
  const program = getProgram(item.program);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="flex h-full flex-col rounded-xl border border-mist bg-paper p-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="info">{program?.shortName ?? item.program}</StatusBadge>
        {item.status === "funded" ? (
          <StatusBadge tone="success">Fully funded</StatusBadge>
        ) : (
          <StatusBadge tone="warning">Open for support</StatusBadge>
        )}
      </div>
      <Heading className="mt-4 text-xl">
        <Link
          href={`/children-and-families/${item.slug}`}
          className="underline-offset-4 hover:underline"
        >
          {item.title}
        </Link>
      </Heading>
      <p className="mt-1 text-base text-slate">
        {item.displayName}, age {item.ageBand}, {item.region}
      </p>
      <p className="mt-3 flex-1 text-base">{item.needSummary}</p>
      <FundingProgress
        className="mt-5"
        raised={item.raised}
        target={item.target}
        label={`Funding progress for ${item.title}`}
      />
    </article>
  );
}

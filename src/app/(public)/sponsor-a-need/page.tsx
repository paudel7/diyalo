import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { UnitProgress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/money";
import { sponsorshipNeeds } from "@/mocks/cases";
import { getProgram } from "@/mocks/programs";

export const metadata: Metadata = { title: "Sponsor a Need" };

export default function SponsorPage() {
  return (
    <>
      <PageHeader
        title="Sponsor a need"
        lead="Pay for a defined item that a program has already decided it needs. Sponsoring a need does not give a donor access to, or any relationship with, a child."
        crumbs={[{ label: "Home", href: "/" }, { label: "Sponsor a Need" }]}
      />
      <Container className="py-12">
        <ul className="divide-y divide-mist border-y border-mist">
          {sponsorshipNeeds.map((n) => {
            const full = n.unitsFunded >= n.unitsNeeded;
            return (
              <li
                key={n.slug}
                className="grid gap-5 py-6 md:grid-cols-[1.4fr_1fr_auto] md:items-center md:gap-8"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl">{n.name}</h2>
                    <StatusBadge tone="info">{getProgram(n.program)?.name}</StatusBadge>
                  </div>
                  <p className="mt-1 text-base text-slate">{n.description}</p>
                  <p className="mt-2 font-semibold">{formatMoney(n.unitCost)} each</p>
                </div>
                <UnitProgress
                  done={n.unitsFunded}
                  total={n.unitsNeeded}
                  unitLabel="funded"
                  label={`Units funded for ${n.name}`}
                />
                {full ? (
                  <StatusBadge tone="success">Fully sponsored</StatusBadge>
                ) : (
                  <ButtonLink href={`/donate?need=${n.slug}&amount=${n.unitCost.minor / 100}`}>
                    Sponsor one
                  </ButtonLink>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}

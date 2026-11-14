import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-base">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.label} className="flex items-center gap-2">
              {c.href && !last ? (
                <Link href={c.href} className="underline underline-offset-4">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{c.label}</span>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Top of every inner page: breadcrumbs, the page's single h1 and a one-sentence lead. */
export function PageHeader({
  title,
  lead,
  crumbs,
  actions,
  dark = false,
}: {
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  dark?: boolean;
}) {
  return (
    <header className={dark ? "surface-dark bg-ink text-snow" : "border-b border-mist bg-paper"}>
      <Container className="py-10 sm:py-14">
        {crumbs && (
          <div className={dark ? "mb-5 text-night-text" : "mb-5 text-slate"}>
            <Breadcrumbs items={crumbs} />
          </div>
        )}
        <h1 className="max-w-3xl text-4xl sm:text-5xl">{title}</h1>
        {lead && (
          <p className={`mt-4 max-w-2xl text-xl ${dark ? "text-night-text" : "text-slate"}`}>
            {lead}
          </p>
        )}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </Container>
    </header>
  );
}

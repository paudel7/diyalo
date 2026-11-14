import Link from "next/link";
import { Wordmark } from "@/components/brand/lamp";
import { Container } from "@/components/layout/container";
import { footerGroups } from "@/lib/navigation";
import { organization } from "@/lib/config/organization";

export function SiteFooter() {
  return (
    <footer className="surface-dark bg-ink-deep text-night-text">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Wordmark dark />
            <p className="mt-4 max-w-sm text-base">{organization.tagline}</p>
            <p className="mt-6 max-w-sm text-sm">
              Legal entity: {organization.legalReceivingEntity}. DIYALO has not confirmed its legal
              receiving entity, partner approvals or receipt arrangements. This notice is replaced
              once those decisions are confirmed.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="font-sans text-base font-semibold tracking-normal text-snow">
                  {group.title}
                </h2>
                <ul className="mt-3 space-y-2 text-base">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="underline-offset-4 hover:text-snow hover:underline"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}

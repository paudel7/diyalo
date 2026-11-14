"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/brand/lamp";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { primaryNav, utilityNav, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  className,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "underline-offset-[10px] hover:underline",
        active && "underline decoration-flame decoration-[3px]",
        className,
      )}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-mist bg-paper">
      <div className="hidden bg-snow lg:block">
        <Container className="flex justify-end gap-6 py-1.5 text-sm font-semibold text-slate">
          {utilityNav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </Container>
      </div>
      <Container className="flex items-center justify-between gap-4 py-3">
        <Link href="/" aria-label="DIYALO home" onClick={close}>
          <Wordmark />
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-7 text-base font-semibold lg:flex"
        >
          {primaryNav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/donate" size="md" onClick={close}>
            Donate now
          </ButtonLink>
          <button
            type="button"
            className="inline-flex min-h-12 items-center rounded-lg border-2 border-ink px-4 font-semibold lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </Container>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main (mobile)"
          className="border-t border-mist bg-paper lg:hidden"
        >
          <Container className="py-4">
            <ul className="space-y-1 text-lg font-semibold">
              {[...primaryNav, ...utilityNav].map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    pathname={pathname}
                    onNavigate={close}
                    className="block rounded-lg px-2 py-2.5"
                  />
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}

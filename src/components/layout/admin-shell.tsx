"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Wordmark } from "@/components/brand/lamp";
import type { AdminNavItem } from "@/lib/navigation";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/**
 * Admin frame: dark side navigation on desktop, collapsible menu on phones. The navigation is
 * filtered by the signed-in user's permissions for convenience; it is not a security control.
 */
export function AdminShell({
  children,
  nav: navItems,
  userName,
  roleNames,
  signOutAction,
}: {
  children: ReactNode;
  nav: AdminNavItem[];
  userName: string;
  roleNames: string[];
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-base font-semibold",
                active ? "bg-flame text-ink" : "text-night-text hover:bg-ink-soft hover:text-snow",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="surface-dark bg-ink text-snow lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:px-5 lg:py-6">
          <Link href="/admin" aria-label="DIYALO admin home">
            <Wordmark dark />
          </Link>
          <button
            type="button"
            className="min-h-11 rounded-lg border-2 border-snow px-4 font-semibold lg:hidden"
            aria-expanded={open}
            aria-controls="admin-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
        <nav
          id="admin-menu"
          aria-label="Admin"
          className={cn("px-3 pb-6 lg:block", open ? "block" : "hidden")}
        >
          {nav}
        </nav>
      </aside>
      <div className="min-w-0">
        <section
          aria-label="Session"
          className="flex flex-wrap items-center justify-between gap-3 border-b border-mist bg-paper px-4 py-3 sm:px-8"
        >
          <p className="text-base text-slate">
            Signed in as <span className="font-semibold text-ink">{userName}</span>
            {roleNames.length > 0 ? ` (${roleNames.join(", ")})` : " (no roles assigned)"}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/account"
              className="text-base font-semibold underline underline-offset-4"
            >
              Account
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="min-h-10 rounded-lg border-2 border-ink px-4 text-base font-semibold hover:bg-ink hover:text-snow"
              >
                Sign out
              </button>
            </form>
          </div>
        </section>
        <div className="px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

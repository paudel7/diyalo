import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/lamp";

export const metadata: Metadata = {
  title: { default: "Staff sign-in", template: "%s | DIYALO staff" },
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="min-h-screen bg-snow">
        <header className="px-4 py-5 sm:px-8">
          <Link href="/" aria-label="DIYALO home">
            <Wordmark />
          </Link>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-md px-4 pb-16 pt-6 outline-none"
        >
          <div className="rounded-xl border border-mist bg-paper p-6 sm:p-8">{children}</div>
          <p className="mt-6 text-center text-base text-slate">
            Staff access only. Donors and applicants do not sign in here.
          </p>
        </main>
      </div>
    </>
  );
}

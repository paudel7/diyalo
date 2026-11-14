import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Page width and gutters. 16px side gutters on phones, wider on larger screens. */
export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</Tag>
  );
}

type Tone = "default" | "paper" | "dark" | "tint";

const toneClass: Record<Tone, string> = {
  default: "",
  paper: "bg-paper",
  dark: "surface-dark bg-ink text-snow",
  tint: "bg-flame-tint",
};

/** Vertical page section. Pass `labelledBy` to expose it as a named landmark region. */
export function Section({
  children,
  tone = "default",
  className,
  labelledBy,
  id,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  labelledBy?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("py-14 sm:py-20", toneClass[tone], className)}
    >
      <Container>{children}</Container>
    </section>
  );
}

import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "outline-light" | "ghost" | "danger";
export type ButtonSize = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold leading-tight " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-60 text-center";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-flame text-ink hover:bg-flame-hover",
  secondary: "bg-ink text-snow hover:bg-ink-soft",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-snow",
  "outline-light": "border-2 border-snow text-snow hover:bg-snow hover:text-ink",
  ghost: "text-ink hover:bg-mist",
  danger: "bg-rhodo text-white hover:bg-[#8f2340]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-base",
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-7 text-lg",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}

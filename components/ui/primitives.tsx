import Link from "next/link";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "line";
  className?: string;
  external?: boolean;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  external,
}: ButtonProps) {
  const styles = {
    primary:
      "bg-accent text-accent-ink hover:opacity-90",
    ghost: "bg-transparent text-ink hover:bg-canvas-2",
    line: "border border-line-strong bg-transparent text-ink hover:bg-canvas-2",
  }[variant];
  const cls = `inline-flex items-center justify-center rounded-[8px] px-4 py-2.5 text-sm font-medium transition ${styles} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

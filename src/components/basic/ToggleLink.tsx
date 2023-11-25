import { HTMLProps, ReactNode } from "react";
import Link from "next/link";

interface ToggleLinkProps extends HTMLProps<HTMLAnchorElement> {
  children: ReactNode;
  href?: string;
  className?: string;
  disabled?: boolean;
}

export function ToggleLink({
  children,
  href = "",
  disabled,
  className,
  ...props
}: ToggleLinkProps) {
  return disabled || href === "#" ? (
    <span className={className} {...props}>
      {children}
    </span>
  ) : (
    <Link href={disabled ? "#" : href} passHref>
      <a className={className}>{children}</a>
    </Link>
  );
}

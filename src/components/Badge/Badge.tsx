import { ReactNode } from "react";
import clsx from "clsx";
import {
  ColorType,
  SizeType,
  BADGE_COLOR_CLASS,
  BADGE_SIZE_CLASS,
  BADGE_COLOR_INVERTED_CLASS,
} from "@/style";

interface BadgeProps {
  className?: string;
  color?: ColorType;
  size?: SizeType;
  children?: ReactNode;
  inverted?: boolean;
}

export function Badge({
  className,
  color = "primary",
  size = "m",
  inverted,
  children,
}: BadgeProps) {
  return (
    <div
      className={clsx(
        "rounded-sm h-fit",
        BADGE_SIZE_CLASS[size],
        inverted ? BADGE_COLOR_INVERTED_CLASS[color] : BADGE_COLOR_CLASS[color],
        className
      )}
    >
      {children}
    </div>
  );
}

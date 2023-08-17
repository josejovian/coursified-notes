import clsx from "clsx";
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

export interface MatchCardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: ReactNode;
  className: string;
  solved?: number;
}
export function MatchCard({
  children,
  className,
  solved = 0,
  ...props
}: MatchCardProps) {
  return (
    <div
      {...props}
      className={clsx(
        "Match_right flex align-self-end justify-center items-center",
        "w-24 px-8 py-2",
        "text-center transition-colors rounded-sm",
        solved === 1
          ? "bg-success-2 border border-success-5"
          : "bg-primary-2 border border-primary-5 hover:bg-primary-3 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

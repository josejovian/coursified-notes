import {
  DetailedHTMLProps,
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
  forwardRef,
} from "react";
import clsx from "clsx";

export interface MatchCardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children?: ReactNode;
  className: string;
  solved?: number;
}
export const MatchCard = forwardRef(function Content(
  { children, className, solved = 0, ...props }: MatchCardProps,
  ref
) {
  return (
    <div
      {...props}
      ref={ref as ForwardedRef<HTMLDivElement>}
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
});

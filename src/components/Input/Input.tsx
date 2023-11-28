import clsx from "clsx";
import {
  ReactNode,
  DetailedHTMLProps,
  ButtonHTMLAttributes,
  useEffect,
} from "react";
import {
  ColorType,
  SizeType,
  INPUT_COLOR_CLASS,
  INPUT_SIZE_CLASS,
} from "@/style";

interface InputProps
  extends Omit<
    DetailedHTMLProps<ButtonHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "size" | "type"
  > {
  classWrapper?: string;
  className?: string;
  color?: ColorType;
  helperText?: ReactNode;
  type?: string;
  state?: "success" | "error";
  disabled?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  size?: SizeType;
  mounted?: boolean;
  onMount?: () => void;
}

export function Input({
  classWrapper,
  className,
  color = "primary",
  helperText,
  type,
  state,
  disabled,
  size = "m",
  mounted,
  onMount,
  ...props
}: InputProps) {
  useEffect(() => {
    if (mounted) return;

    onMount && onMount();
  }, [mounted, onMount]);

  return (
    <div className={clsx(classWrapper)}>
      <input
        className={clsx(
          "border border-secondary-4 p-4",
          INPUT_SIZE_CLASS[size],
          INPUT_COLOR_CLASS[color],
          state === "error" && "bg-danger-1 border-danger-4 outline-danger-4",
          state === "success" &&
            "bg-success-1 border-success-4 outline-success-4",
          className
        )}
        type={type}
        disabled={disabled}
        {...props}
      />
      {helperText && (
        <div
          className={clsx(
            "mt-4",
            state === "error" && "text-danger-4",
            state === "success" && "text-success-4"
          )}
        >
          {helperText}
        </div>
      )}
    </div>
  );
}

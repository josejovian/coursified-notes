import {
  Fragment,
  ReactNode,
  useMemo,
  DetailedHTMLProps,
  ButtonHTMLAttributes,
} from "react";
import clsx from "clsx";
import { BiLoaderAlt } from "react-icons/bi";
import {
  ButtonVariantType,
  ColorType,
  SizeType,
  BUTTON_COLOR_CLASS,
  BUTTON_SIZE_CLASS,
  BUTTON_ICON_SIZE_CLASS,
} from "@/style";

interface ButtonProps
  extends Omit<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    "size"
  > {
  loading?: boolean;
  disabled?: boolean;
  icon?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  color?: ColorType;
  size?: SizeType;
  variant?: ButtonVariantType;
}

export function Button({
  children,
  className,
  loading,
  disabled,
  icon,
  left,
  right,
  color = "primary",
  size = "m",
  variant = "solid",
  ...props
}: ButtonProps) {
  const renderContent = useMemo(() => {
    if (loading)
      return (
        <BiLoaderAlt className={clsx("Icon", loading && "animate-spin")} />
      );
    return (
      <Fragment>
        {left}
        {children}
        {right}
      </Fragment>
    );
  }, [left, right, children, loading]);

  return (
    <button
      {...props}
      className={clsx(
        className,
        "flex items-center outline-transparent transition-colors",
        "text-white",
        BUTTON_COLOR_CLASS(color, variant),
        icon
          ? [BUTTON_ICON_SIZE_CLASS[size], "justify-center"]
          : BUTTON_SIZE_CLASS[size],
        (left || right) && "gap-2",
        disabled ? ["cursor-not-allowed"] : "hover:shadow-md"
      )}
      disabled={disabled}
    >
      {renderContent}
    </button>
  );
}

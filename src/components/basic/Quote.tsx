import clsx from "clsx";
import {
  Fragment,
  ReactNode,
  useMemo,
  DetailedHTMLProps,
  ButtonHTMLAttributes,
} from "react";
import {
  ColorType,
  BLOCKQUOTE_COLOR_CLASS,
  BLOCKQUOTE_VARIANT_CLASS,
} from "@/style";
import { BlockquoteVariantType } from "@/style/variants";

export interface BaseQuoteProps {
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
  color?: ColorType;
  variant?: BlockquoteVariantType;
}

export interface QuoteProps
  extends BaseQuoteProps,
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLQuoteElement>,
      HTMLQuoteElement
    > {
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
  color?: ColorType;
  variant?: BlockquoteVariantType;
}

export function Blockquote(props: QuoteProps) {
  const propsWithVariant = {
    ...props,
    ...(props.variant ? BLOCKQUOTE_VARIANT_CLASS[props.variant] : {}),
  };

  const {
    left,
    children,
    right,
    className,
    color = "primary",
    ...rest
  } = propsWithVariant;

  const renderContent = useMemo(() => {
    return (
      <Fragment>
        {left}
        {children}
        {right}
      </Fragment>
    );
  }, [left, right, children]);

  return (
    <blockquote
      className={clsx(
        "min-w-0 w-fit my-8 px-8 py-2",
        "border leading-10",
        BLOCKQUOTE_COLOR_CLASS[color],
        className
      )}
      {...rest}
    >
      {renderContent}
    </blockquote>
  );
}

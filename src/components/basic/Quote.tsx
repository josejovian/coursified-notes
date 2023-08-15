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
  BLOCKQUOTE_PRESET_CLASS,
  BlockquotePresetType,
} from "@/src/style";

export interface BaseQuoteProps {
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
  color?: ColorType;
  preset?: BlockquotePresetType;
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
  preset?: BlockquotePresetType;
}

export function Blockquote(props: QuoteProps) {
  const propsWithPreset = {
    ...props,
    ...(props.preset ? BLOCKQUOTE_PRESET_CLASS[props.preset] : {}),
  };

  const {
    left,
    children,
    right,
    className,
    color = "primary",
    ...rest
  } = propsWithPreset;

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
        "border-0 border-l-4 leading-10",
        BLOCKQUOTE_COLOR_CLASS[color],
        className
      )}
      {...rest}
    >
      {renderContent}
    </blockquote>
  );
}

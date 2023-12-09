import { CSSProperties, ReactNode, useMemo } from "react";
import {
  FONT_COLOR,
  FONT_SIZE,
  FONT_WEIGHT,
  FontColor,
  FontSize,
  FontWeight,
} from "@/consts/style";
import clsx from "clsx";

export interface ParagraphProps {
  as?: "span" | "p" | "h1" | "h2" | "h3" | "a";
  weight?: FontWeight;
  id?: string;
  size?: FontSize;
  color?: FontColor;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function Paragraph({
  as = "span",
  weight,
  size = "m",
  color = "secondary-8",
  className: propsClass,
  ...rest
}: ParagraphProps) {
  const className = useMemo(
    () =>
      clsx(
        FONT_COLOR[color],
        FONT_SIZE[size],
        weight && FONT_WEIGHT[weight],
        propsClass
      ),
    [color, size, weight, propsClass]
  );

  const props = useMemo(
    () => ({
      ...rest,
      className,
    }),
    [rest, className]
  );

  const render = useMemo(() => {
    switch (as) {
      case "a":
        return <a {...props} />;
      case "span":
        return <span {...props} />;
      case "p":
        return <p {...props} />;
      case "h1":
        return <h1 {...props} />;
      case "h2":
        return <h2 {...props} />;
      case "h3":
        return <h3 {...props} />;
    }
  }, [as, props]);

  return render;
}

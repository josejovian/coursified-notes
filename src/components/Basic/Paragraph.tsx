import { Common } from "@/src/type";
import clsx from "clsx";
import { CSSProperties, HTMLProps, ReactNode, useEffect, useMemo } from "react";

interface ParagraphProps {
  as?: "span" | "p" | "h1" | "h2" | "h3";
  weight?: FontWeight;
  size?: FontSize;
  color?: FontColor;
  children?: ReactNode;
  className?: string;
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

const FONT_SIZE = {
  xl: "text-xl",
  l: "text-lg",
  "l-alt": "text-lg-alt",
  m: "",
  "m-alt": "text-md-alt",
  s: "text-sm",
} as const;

type FontSize = keyof typeof FONT_SIZE;

const FONT_WEIGHT = {
  black: "font-black",
  extrabold: "font-extrabold",
  bold: "font-bold",
  semibold: "font-semibold",
  medium: "font-medium",
  normal: "font-normal",
  light: "font-light",
  extralight: "font-extralight",
  thin: "font-thin",
};

type FontWeight = keyof typeof FONT_WEIGHT;

const FONT_COLOR = {
  inherit: "text-inherit",
  "secondary-8": "text-gray-800",
  "secondary-7": "text-gray-700",
  "secondary-6": "text-gray-600",
  "secondary-5": "text-gray-500",
  "secondary-4": "text-gray-400",
  "secondary-3": "text-gray-300",
  "secondary-2": "text-gray-200",
  "secondary-1": "text-gray-100",
  "primary-8": "text-orange-800",
  "primary-7": "text-orange-700",
  "primary-6": "text-orange-600",
  "primary-5": "text-orange-500",
  "primary-4": "text-orange-400",
  "primary-3": "text-orange-300",
  "primary-2": "text-orange-200",
  "primary-1": "text-orange-100",
};

type FontColor = keyof typeof FONT_COLOR;

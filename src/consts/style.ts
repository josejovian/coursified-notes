export const FONT_SIZE = {
  xl: "!text-xl",
  l: "!text-lg !leading-8",
  "l-alt": "!text-lg-alt",
  m: "",
  "m-alt": "!text-md-alt",
  s: "!text-sm",
} as const;

export type FontSize = keyof typeof FONT_SIZE;

export const FONT_WEIGHT = {
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

export type FontWeight = keyof typeof FONT_WEIGHT;

export const FONT_COLOR = {
  inherit: "text-inherit",
  "secondary-8": "text-zinc-800",
  "secondary-7": "text-zinc-700",
  "secondary-6": "text-zinc-600",
  "secondary-5": "text-zinc-500",
  "secondary-4": "text-zinc-400",
  "secondary-3": "text-zinc-300",
  "secondary-2": "text-zinc-200",
  "secondary-1": "text-zinc-100",
  "primary-8": "text-orange-800",
  "primary-7": "text-orange-700",
  "primary-6": "text-orange-600",
  "primary-5": "text-orange-500",
  "primary-4": "text-orange-400",
  "primary-3": "text-orange-300",
  "primary-2": "text-orange-200",
  "primary-1": "text-orange-100",
};

export type FontColor = keyof typeof FONT_COLOR;

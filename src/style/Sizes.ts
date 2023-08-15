import { StyleClassType } from "../type";

export type SizeType = "s" | "m" | "l";

export const BUTTON_SIZE_CLASS: StyleClassType<SizeType> = {
  s: "h-8 text-sm",
  m: "h-10 px-4",
  l: "h-12 text-lg-alt px-6",
};

export const BUTTON_ICON_SIZE_CLASS: StyleClassType<SizeType> = {
  s: "h-8 w-8",
  m: "h-10 w-10",
  l: "h-12 h-12",
};

export const INPUT_SIZE_CLASS: StyleClassType<SizeType> = {
  s: "py-1 px-2 text-sm",
  m: "py-2 px-4",
  l: "py-2 px-4 text-lg-alt",
};

export const BADGE_SIZE_CLASS: StyleClassType<SizeType> = {
  s: "text-sm",
  m: "px-2 text-sm",
  l: "py-2 px-2 text-md",
};

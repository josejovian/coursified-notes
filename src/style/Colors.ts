import clsx from "clsx";
import { ButtonVariantType } from "./variants";

export const COLORS = [
  "primary",
  "secondary",
  "tertiary",
  "success",
  "warning",
  "danger",
  "information",
] as const;

export type ColorType = (typeof COLORS)[number];

export function BUTTON_COLOR_CLASS(
  color: ColorType = "primary",
  variant: ButtonVariantType = "solid"
) {
  const BASE_STYLE = clsx(variant === "solid" && "text-white");

  const SPECIFIC_STYLES = {
    primary: clsx(
      variant === "solid" && [
        "bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
        "outline-primary-5 disabled:bg-primary-3",
      ],
      variant === "outline" && [
        "border border-secondary-5 bg-orange-500/0 hover:bg-orange-500/10 active:bg-orange-500/20 text-secondary-5",
        "outline-primary-5 disabled:opacity-50",
      ]
    ),
    secondary: clsx(
      variant === "solid" && [
        "bg-secondary-7 hover:bg-secondary-6 active:bg-secondary-5 text-seocndary-1",
        "outline-secondary-8 disabled:bg-secondary-6 disabled:text-secondary-5",
      ],
      variant === "outline" && [
        "border border-secondary-5 bg-gray-500/0 hover:bg-gray-500/10 active:bg-gray-500/20 text-secondary-5",
        "outline-secondary-5 disabled:opacity-50",
      ]
    ),
    tertiary: clsx(
      variant === "solid" && [
        "bg-secondary-1 hover:bg-secondary-2 active:bg-secondary-3 text-secondary-7",
        "outline-secondary-1 disabled:bg-secondary-1",
      ],
      variant === "outline" && [
        "border border-secondary-5 bg-gray-500/0 hover:bg-gray-500/10 active:bg-gray-500/20 text-secondary-5",
        "outline-secondary-5 disabled:opacity-50",
      ]
    ),
    success: clsx(
      variant === "solid" && [
        "bg-success-5 hover:bg-success-6 active:bg-success-7",
        "outline-success-5 disabled:bg-success-3",
      ],
      variant === "outline" && [
        "bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
        "outline-primary-5 disabled:bg-primary-3",
      ]
    ),
    warning: clsx(
      variant === "solid" && [
        "bg-warning-4 hover:bg-warning-5 active:bg-warning-6",
        "outline-warning-4 disabled:bg-warning-1 text-black",
      ],
      variant === "outline" && [
        "bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
        "outline-primary-5 disabled:bg-primary-3",
      ]
    ),
    danger: clsx(
      variant === "solid" && [
        "bg-danger-5 hover:bg-danger-6 active:bg-danger-7",
        "outline-danger-5 disabled:bg-danger-3",
      ],
      variant === "outline" && [
        "bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
        "outline-primary-5 disabled:bg-primary-3",
      ]
    ),
    information: clsx(
      variant === "solid" && [
        "bg-information-5 hover:bg-information-6 active:bg-information-7",
        "outline-information-5 disabled:bg-information-3",
      ],
      variant === "outline" && [
        "bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
        "outline-primary-5 disabled:bg-primary-3",
      ]
    ),
  };

  return clsx(BASE_STYLE, SPECIFIC_STYLES[color]);
}

export const INPUT_COLOR_CLASS: { [key in ColorType]: string } = {
  primary: "focus:outline-primary-4",
  secondary: "focus:outline-secondary-9",
  tertiary: "focus:outline-secondary-2",
  success: "focus:outline-success-4",
  warning: "focus:outline-warning-4",
  danger: "focus:outline-danger-4",
  information: "focus:outline-information-4",
};

export const BLOCKQUOTE_COLOR_CLASS: { [key in ColorType]: string } = {
  primary: "border-primary-6 bg-primary-2 text-primary-9",
  secondary: "border-secondary-6 bg-secondary-2 text-secondary-9",
  tertiary: "border-secondary-9 bg-secondary-9 text-secondary-2",
  success: "border-success-6 bg-success-2 text-success-9",
  warning: "border-warning-6 bg-warning-2 text-warning-9",
  danger: "border-danger-6 bg-danger-2 text-danger-9",
  information: "border-information-6 bg-information-2 text-information-9",
};

export const BADGE_COLOR_CLASS: { [key in ColorType]: string } = {
  primary: "bg-primary-2 text-primary-9",
  secondary: "bg-secondary-9 text-secondary-2",
  tertiary: "bg-secondary-2 text-secondary-9",
  success: "bg-success-2 text-success-9",
  warning: "bg-warning-2 text-warning-9",
  danger: "bg-danger-2 text-danger-9",
  information: "bg-information-2 text-information-9",
};

export const BADGE_COLOR_INVERTED_CLASS: { [key in ColorType]: string } = {
  primary: "text-primary-2 bg-primary-9",
  secondary: "text-secondary-9 bg-secondary-2",
  tertiary: "text-secondary-2 bg-secondary-9",
  success: "text-success-2 bg-success-9",
  warning: "text-warning-2 bg-warning-9",
  danger: "text-danger-2 bg-danger-9",
  information: "text-information-2 bg-information-9",
};

export const TOAST_COLOR_CLASS: { [key in ColorType]: string } = {
  primary: "bg-primary-6",
  secondary: "bg-secondary-9",
  tertiary: "bg-secondary-2 text-secondary-9",
  success: "bg-success-6",
  warning: "bg-warning-6",
  danger: "bg-danger-6",
  information: "bg-information-6",
};

export type ButtonVariantType = "solid" | "outline";

import { StylePropsType, ToastType } from "../types";
import {
  BsCheckCircleFill,
  BsFillExclamationCircleFill,
  BsFillExclamationTriangleFill,
  BsFillInfoCircleFill,
} from "react-icons/bs";
import { BaseQuoteProps } from "../components";

export const BLOCKQUOTE_VARIANTS = [
  "formula",
  "explanation",
  "example",
  "theorem",
] as const;

export type BlockquoteVariantType = (typeof BLOCKQUOTE_VARIANTS)[number];

export const BLOCKQUOTE_VARIANT_CLASS: StylePropsType<
  BlockquoteVariantType,
  BaseQuoteProps
> = {
  formula: {
    color: "primary",
  },
  explanation: {
    color: "success",
  },
  example: {
    color: "warning",
  },
  theorem: {
    color: "information",
  },
};

export const TOAST_VARIANTS = [
  "success",
  "warning",
  "danger",
  "information",
  "default",
] as const;

export type ToastVariantType = (typeof TOAST_VARIANTS)[number];

export const TOAST_VARIANT_CLASS: StylePropsType<ToastVariantType, ToastType> =
  {
    success: {
      color: "success",
      icon: BsCheckCircleFill,
    },
    warning: {
      color: "warning",
      icon: BsFillExclamationTriangleFill,
    },
    danger: {
      color: "danger",
      icon: BsFillExclamationCircleFill,
    },
    information: {
      color: "information",
      icon: BsFillInfoCircleFill,
    },
    default: {
      color: "secondary",
    },
  };

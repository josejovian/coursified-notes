import { ToastPhraseType } from "../../consts";
import { ColorType, ToastVariantType } from "../../style";
import { IconType } from "react-icons";

export interface ToastBaseType {
  title?: string;
  color?: ColorType;
  icon?: IconType;
  variant?: ToastVariantType;
}

export interface ToastUnspecifiedType {
  message: string;
  phrase: never;
}

export interface ToastSpecifiedType {
  message?: string;
  phrase: ToastPhraseType;
}

export type ToastType = ToastBaseType &
  (ToastUnspecifiedType | ToastSpecifiedType);

export interface ToastActionBaseType {
  id?: string;
  standby?: boolean;
  dead?: boolean;
  duration?: number;
}

export type ToastActionType = ToastActionBaseType & ToastType;

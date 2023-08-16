import { ColorType, ToastPresetType } from "../style";
import { IconType } from "react-icons";

export interface ToastType {
  id?: string;
  title?: string;
  message: string;
  color?: ColorType;
  icon?: IconType;
  preset?: ToastPresetType;
  standby?: boolean;
  dead?: boolean;
  duration?: number;
}

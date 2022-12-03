import { ReactNode } from "react";
import { ColorType, ToastPresetType } from "../style";

export interface ToastType {
	id?: string;
	title?: string;
	message: string;
	color?: ColorType;
	icon?: ReactNode;
	preset?: ToastPresetType;
	dead?: boolean;
	duration?: number;
}
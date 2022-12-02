import { ReactNode } from "react";

export interface ToastType {
	id?: string;
	title?: string;
	message: string;
	icon?: ReactNode;
	duration?: number;
}
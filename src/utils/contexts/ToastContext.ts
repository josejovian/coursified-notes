import { ToastType } from "@/src/type";
import { createContext } from "react";

export const ToastContext = createContext<
	(setToasts: (toasts: ToastType[]) => ToastType[]) => void
>(() => {});

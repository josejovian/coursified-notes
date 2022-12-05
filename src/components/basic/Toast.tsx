import { TOAST_COLOR_CLASS, TOAST_PRESET_CLASS } from "@/src/style";
import { ToastType } from "@/src/type";
import clsx from "clsx";
import { useMemo } from "react";
import { BsX } from "react-icons/bs";

interface ToastProps extends ToastType {
	handleDeleteToast: () => void;
}

export function Toast(props: ToastProps) {
	const propsWithPreset = {
		...props,
		...(props.preset ? TOAST_PRESET_CLASS[props.preset] : {}),
	};

	const {
		icon,
		title,
		message,
		color = "secondary",
		handleDeleteToast,
		dead,
	} = propsWithPreset;

	return (
		<div
			className={clsx(
				"flex items-center gap-4 pl-5 pr-3 py-3 h-max",
				"rounded-md shadow-md text-white",
				TOAST_COLOR_CLASS[color],
				dead && "opacity-0 scale-0 h-0",
				"transition-all bg-red-200"
			)}
		>
			{icon && <span className={title ? "Icon-xl" : "Icon"}>{icon}</span>}
			<div className="flex flex-col">
				<span className="font-semibold tracking-wide">{title}</span>
				<span>{message}</span>
			</div>
			<div
				className="Icon-xl hover:opacity-50 active:opacity-25 transition-opacity"
				onClick={handleDeleteToast}
			>
				<BsX />
			</div>
		</div>
	);
}

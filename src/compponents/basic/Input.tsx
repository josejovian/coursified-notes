import { ColorType, INPUT_COLOR_CLASS } from "@/src/style/Colors";
import { SizeType } from "@/src/style/Sizes";
import clsx from "clsx";
import { ReactNode, DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import { INPUT_SIZE_CLASS } from "@/src/style/Sizes";

interface InputProps
	extends Omit<
		DetailedHTMLProps<
			ButtonHTMLAttributes<HTMLInputElement>,
			HTMLInputElement
		>,
		"size" | "type"
	> {
	className?: string;
	color?: ColorType;
	helperText?: string;
	type?: string;
	state?: "success" | "error";
	disabled?: boolean;
	left?: ReactNode;
	right?: ReactNode;
	size?: SizeType;
}

export default function Input({
	className,
	color = "primary",
	helperText,
	type,
	state,
	disabled,
	left,
	right,
	size = "m",
	...props
}: InputProps) {
	return (
		<div className="flex">
			<input
				className={clsx(
					"border-2 border-secondary-4 p-4",
					INPUT_SIZE_CLASS[size],
					INPUT_COLOR_CLASS[color],
					state === "error" && "border-danger-4 outline-danger-4",
					state === "success" && "border-success-4 outline-success-4",
					className
				)}
				type={type}
				disabled={disabled}
				{...props}
			/>
			{helperText && (
				<span
					className={clsx(
						"mt-4",
						state === "error" && "text-danger-4",
						state === "success" && "text-success-4"
					)}
				>
					{helperText}
				</span>
			)}
		</div>
	);
}

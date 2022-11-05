import { ButtonVariantType } from "@/src/style/Variants";
import { ColorType } from "@/src/style/Colors";
import { SizeType } from "@/src/style/Sizes";
import clsx from "clsx";
import {
	Fragment,
	HTMLProps,
	ReactNode,
	useMemo,
	DetailedHTMLProps,
	ButtonHTMLAttributes,
} from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { BUTTON_COLOR_CLASS } from "@/src/style/Colors";
import { BUTTON_SIZE_CLASS } from "@/src/style/Sizes";

interface ButtonProps
	extends Omit<
		DetailedHTMLProps<
			ButtonHTMLAttributes<HTMLButtonElement>,
			HTMLButtonElement
		>,
		"size"
	> {
	loading?: boolean;
	disabled?: boolean;
	left?: ReactNode;
	right?: ReactNode;
	color?: ColorType;
	size?: SizeType;
	variant?: ButtonVariantType;
}

export default function Button({
	children,
	loading,
	disabled,
	left,
	right,
	color = "primary",
	size = "m",
	variant = "solid",
	...props
}: ButtonProps) {
	const renderContent = useMemo(() => {
		if (loading)
			return (
				<BiLoaderAlt
					className={clsx("Icon", loading && "animate-spin")}
				/>
			);
		return (
			<Fragment>
				{left}
				{children}
				{right}
			</Fragment>
		);
	}, [left, right, children, loading]);

	return (
		<button
			className={clsx(
				"px-4 flex items-center outline-transparent transition-colors",
				"text-white rounded-md",
				BUTTON_COLOR_CLASS(color, variant),
				BUTTON_SIZE_CLASS[size],
				(left || right) && "gap-2",
				disabled ? ["cursor-not-allowed"] : "hover:shadow-md"
			)}
			disabled={disabled}
			{...props}
		>
			{renderContent}
		</button>
	);
}

import clsx from "clsx";
import {
	Fragment,
	ReactNode,
	useMemo,
	DetailedHTMLProps,
	ButtonHTMLAttributes,
} from "react";
import { BiLoaderAlt } from "react-icons/bi";
import {
	ButtonVariantType,
	ColorType,
	SizeType,
	BUTTON_COLOR_CLASS,
	BUTTON_SIZE_CLASS,
} from "@/src/style";

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

export function Button({
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

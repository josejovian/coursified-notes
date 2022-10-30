import { ColorType, COLOR_CLASS } from "@/src/style/Colors";
import { SizeType, SIZE_CLASS } from "@/src/style/Sizes";
import clsx from "clsx";
import { Fragment, HTMLProps, ReactNode, useMemo } from "react";
import { BiLoaderAlt } from "react-icons/bi";

interface ButtonProps extends Omit<HTMLProps<HTMLButtonElement>, "size"> {
	loading?: boolean;
	disabled?: boolean;
	left?: ReactNode;
	right?: ReactNode;
	color?: ColorType;
	size?: SizeType;
}

export default function Button({
	children,
	loading,
	disabled,
	left,
	right,
	color = "primary",
	size = "m",
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
				COLOR_CLASS[color],
				SIZE_CLASS[size],
				(left || right) && "gap-2",
				disabled ? ["cursor-not-allowed"] : "hover:shadow-md"
			)}
			disabled={disabled}
		>
			{renderContent}
		</button>
	);
}

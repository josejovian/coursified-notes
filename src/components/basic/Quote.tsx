import clsx from "clsx";
import {
	Fragment,
	ReactNode,
	useMemo,
	DetailedHTMLProps,
	ButtonHTMLAttributes,
} from "react";
import { ColorType, BLOCKQUOTE_COLOR_CLASS } from "@/src/style";

interface QuoteProps
	extends DetailedHTMLProps<
		ButtonHTMLAttributes<HTMLQuoteElement>,
		HTMLQuoteElement
	> {
	className?: string;
	left?: ReactNode;
	right?: ReactNode;
	color?: ColorType;
}

export function Blockquote({
	children,
	className,
	left,
	right,
	color = "primary",
	...props
}: QuoteProps) {
	const renderContent = useMemo(() => {
		return (
			<Fragment>
				{left}
				{children}
				{right}
			</Fragment>
		);
	}, [left, right, children]);

	return (
		<blockquote
			className={clsx(
				"min-w-0 w-fit my-8 pl-16 pr-8 py-2",
				"border-0 border-l-4 leading-10",
				BLOCKQUOTE_COLOR_CLASS[color],
				className
			)}
			{...props}
		>
			{renderContent}
		</blockquote>
	);
}

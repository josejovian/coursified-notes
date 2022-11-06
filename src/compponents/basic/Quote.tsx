import { BLOCKQUOTE_COLOR_CLASS, ColorType } from "@/src/style/Colors";
import clsx from "clsx";
import {
	Fragment,
	ReactNode,
	useMemo,
	DetailedHTMLProps,
	ButtonHTMLAttributes,
} from "react";

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

export default function Blockquote({
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
				className,
				"my-8 pl-16 pr-4 py-2 border-0 border-l-4 leading-10",
				BLOCKQUOTE_COLOR_CLASS[color]
			)}
			{...props}
		>
			{renderContent}
		</blockquote>
	);
}

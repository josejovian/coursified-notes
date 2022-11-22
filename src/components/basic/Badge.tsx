import clsx from "clsx";
import { ReactNode, DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import {
	ColorType,
	SizeType,
	BADGE_COLOR_CLASS,
	BADGE_SIZE_CLASS,
} from "@/src/style";

interface BadgeProps {
	className?: string;
	color?: ColorType;
	size?: SizeType;
	left?: ReactNode;
	right?: ReactNode;
	children?: ReactNode;
}

export function Badge({
	className,
	color = "primary",
	size = "m",
	left,
	right,
	children,
}: BadgeProps) {
	return (
		<div
			className={clsx(
				"rounded-sm",
				BADGE_SIZE_CLASS[size],
				BADGE_COLOR_CLASS[color],
				className
			)}
		>
			{children}
		</div>
	);
}

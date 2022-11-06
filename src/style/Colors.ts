import clsx from "clsx";
import { ButtonVariantType } from "./Variants";

export type ColorType =
	| "primary"
	| "secondary"
	| "success"
	| "warning"
	| "danger";

export function BUTTON_COLOR_CLASS(
	color: ColorType = "primary",
	variant: ButtonVariantType = "solid"
) {
	const BASE_STYLE = clsx(variant === "solid" && "text-white");

	const SPECIFIC_STYLES = {
		primary: clsx(
			variant === "solid" && [
				"bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
				"outline-primary-5 disabled:bg-primary-3",
			],
			variant === "outline" && [
				"border border-secondary-5 bg-orange-500/0 hover:bg-orange-500/10 active:bg-orange-500/20 text-secondary-5",
				"outline-primary-5 disabled:opacity-50",
			]
		),
		secondary: clsx(
			variant === "solid" && [
				"bg-secondary-5 hover:bg-secondary-6 active:bg-secondary-7",
				"outline-secondary-5 disabled:bg-secondary-3",
			],
			variant === "outline" && [
				"border border-secondary-5 bg-gray-500/0 hover:bg-gray-500/10 active:bg-gray-500/20 text-secondary-5",
				"outline-secondary-5 disabled:opacity-50",
			]
		),
		success: clsx(
			variant === "solid" && [
				"bg-success-5 hover:bg-success-6 active:bg-success-7",
				"outline-success-5 disabled:bg-success-3",
			],
			variant === "outline" && [
				"bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
				"outline-primary-5 disabled:bg-primary-3",
			]
		),
		warning: clsx(
			variant === "solid" && [
				"bg-warning-4 hover:bg-warning-5 active:bg-warning-6",
				"outline-warning-4 disabled:bg-warning-1 text-black",
			],
			variant === "outline" && [
				"bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
				"outline-primary-5 disabled:bg-primary-3",
			]
		),
		danger: clsx(
			variant === "solid" && [
				"bg-danger-5 hover:bg-danger-6 active:bg-danger-7",
				"outline-danger-5 disabled:bg-danger-3",
			],
			variant === "outline" && [
				"bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
				"outline-primary-5 disabled:bg-primary-3",
			]
		),
	};

	return clsx(BASE_STYLE, SPECIFIC_STYLES[color]);
}

export const INPUT_COLOR_CLASS: { [key in ColorType]: string } = {
	primary: "focus:outline-primary-4",
	secondary: "focus:outline-secondary-4",
	success: "focus:outline-success-4",
	warning: "focus:outline-warning-4",
	danger: "focus:outline-danger-4",
};

export const BLOCKQUOTE_COLOR_CLASS: { [key in ColorType]: string } = {
	primary: "border-primary-6 bg-primary-2",
	secondary: "border-secondary-6 bg-secondary-2",
	success: "border-success-6 bg-success-2",
	warning: "border-warning-6 bg-warning-2",
	danger: "border-danger-6 bg-danger-2",
};

import clsx from "clsx";

export type ColorType =
	| "primary"
	| "secondary"
	| "success"
	| "warning"
	| "danger";

export const COLOR_CLASS: { [key in ColorType]: string } = {
	primary: clsx(
		"bg-primary-5 hover:bg-primary-6 active:bg-primary-7",
		"outline-primary-5 disabled:bg-primary-3 text-white"
	),
	secondary: clsx(
		"bg-secondary-5 hover:bg-secondary-6 active:bg-secondary-7",
		"outline-secondary-5 disabled:bg-secondary-3 text-white"
	),
	success: clsx(
		"bg-success-5 hover:bg-success-6 active:bg-success-7",
		"outline-success-5 disabled:bg-success-3 text-white"
	),
	warning: clsx(
		"bg-warning-4 hover:bg-warning-5 active:bg-warning-6",
		"outline-warning-4 disabled:bg-warning-1 text-black"
	),
	danger: clsx(
		"bg-danger-5 hover:bg-danger-6 active:bg-danger-7",
		"outline-danger-5 disabled:bg-danger-3 text-white"
	),
};

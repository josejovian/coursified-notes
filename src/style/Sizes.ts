export type SizeType = "s" | "m" | "l";

export const BUTTON_SIZE_CLASS: { [key in SizeType]: string } = {
	s: "h-8 text-sm",
	m: "h-10",
	l: "h-12 text-lg px-10",
};

export const INPUT_SIZE_CLASS: { [key in SizeType]: string } = {
	s: "py-1 px-2 text-sm",
	m: "py-2 px-4",
	l: "py-2 px-4 text-lg",
};

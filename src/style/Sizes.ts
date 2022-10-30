export type SizeType = "s" | "m" | "l";

export const SIZE_CLASS: { [key in SizeType]: string } = {
	s: "h-8 text-sm",
	m: "h-10",
	l: "h-12 text-lg",
};

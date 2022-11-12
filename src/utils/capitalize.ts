export function capitalize(string: string) {
	const words = string
		.split("-")
		.map((word) => word.toUpperCase())
		.join(" ");
}

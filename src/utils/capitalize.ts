export function capitalize(string: string) {
	return string
		.split("-")
		.map((word) => {
			return `${word[0].toUpperCase()}${word.slice(1)}`;
		})
		.join(" ");
}

export function uncapitalize(string: string) {
	return string
		.split(" ")
		.map((word) => word.toLowerCase())
		.join("-");
}

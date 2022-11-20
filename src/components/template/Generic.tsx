import { ReactNode } from "react";

interface GenericProps {
	children: ReactNode
}

export default function GenericTemplate({ children } : GenericProps) {
	return (
		<div>
			{ children }
		</div>
	)
}
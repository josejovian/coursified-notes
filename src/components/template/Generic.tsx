import { ReactNode } from "react";

interface GenericProps {
	children: ReactNode;
}

export function GenericTemplate({ children }: GenericProps) {
	return <div>{children}</div>;
}

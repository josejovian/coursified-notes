import clsx from "clsx";
import { ReactNode } from "react";
import ToggleLink from "../ToggleLink";

interface ProgressMilestoneProps {
	indexText: string;
	title: string;
	id?: string;
	caption?: ReactNode;
	styling?: string;
	link?: string;
}

export default function ProgressMilestone({
	indexText,
	title,
	id,
	caption,
	styling = "",
	link,
}: ProgressMilestoneProps) {
	return (
		<ToggleLink className="text-lg" href={link} disabled={!link}>
			<article
				id={id}
				className={clsx(
					"ProgressMilestone",
					"w-max p-4 bg-gray-100 rounded-md",
					styling
				)}
			>
				<span className="flex flex-col">
					<span className="ProgressMilestone_indexText text-gray-500 text-sm font-medium">
						{indexText}
					</span>
					<h3 className="ProgressMilestone_title text-2xl font-normal">
						{title}
					</h3>
					{caption}
				</span>
			</article>
		</ToggleLink>
	);
}

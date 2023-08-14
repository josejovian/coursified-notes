import clsx from "clsx";

interface MatchDropProps {
	active: any;
	practiceId: string;
	handleClickDrop: () => void;
}

export function MatchDrop({
	active,
	practiceId,
	handleClickDrop,
}: MatchDropProps) {
	return (
		<div
			className={clsx(
				"Match_hole w-24 h-10 px-8 py-2 ml-8",
				"shadow-inner border-secondary-3 border",
				"rounded-sm transition-colors",
				active && active.id === practiceId
					? "bg-success-1 hover:bg-success-2"
					: "bg-white hover:bg-secondary-1"
			)}
			onClick={handleClickDrop}
		></div>
	);
}

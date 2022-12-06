import { AnswerType } from "@/src/type";
import clsx from "clsx";
import { ReactNode, useCallback, useMemo } from "react";
import { MatchCard } from "./MatchCard";
import { MatchDrop } from "./MatchDrop";

export interface MatchBoxProps {
	id: string;
	practiceId: string;
	left: string;
	right: string;
	answer: Partial<AnswerType>;
	active: any;
	handleClickMatchedCard: () => void;
	handleClickUnmatchedCard: () => void;
	handleClickDrop: () => void;
	handleGetComponentForm: (x: string) => ReactNode;
}

export function MatchBox({
	id,
	practiceId,
	left,
	right,
	answer,
	active,
	handleClickMatchedCard,
	handleClickUnmatchedCard,
	handleClickDrop,
	handleGetComponentForm,
}: MatchBoxProps) {
	const currentAnswer = useMemo(
		() => answer[practiceId],
		[answer, practiceId]
	);

	return (
		<div
			key={id}
			id={id}
			className="MatchBox w-full flex justify-between gap-4 mb-8"
		>
			<div className="Match_left flex items-center">
				{handleGetComponentForm(left)}
				{currentAnswer ? (
					<MatchCard
						className="ml-8"
						onClick={handleClickMatchedCard}
					>
						{handleGetComponentForm(currentAnswer)}
					</MatchCard>
				) : (
					<MatchDrop
						active={active}
						practiceId={practiceId}
						handleClickDrop={handleClickDrop}
					/>
				)}
			</div>
			<MatchCard
				className={clsx(
					!currentAnswer && "!bg-primary-2 rounded-sm",
					Object.values(answer).includes(right) && "hidden",
					active &&
						active.answer === right &&
						"!bg-primary-4 hover:bg-primary-5"
				)}
				onClick={handleClickUnmatchedCard}
			>
				{handleGetComponentForm(right)}
			</MatchCard>
		</div>
	);
}

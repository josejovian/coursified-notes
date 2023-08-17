import { AnswerType } from "@/src/type";
import clsx from "clsx";
import * as ReactDOM from "react-dom";
import { ReactNode, useCallback, useEffect, useMemo } from "react";
import { MatchCard, MatchDrop } from "@/src/components";
import TeX from "@matejmazur/react-katex";

export interface MatchBoxProps {
  id: string;
  practiceId: string;
  left: string;
  right: string;
  answer: Partial<AnswerType>;
  active: any;
  solved?: number;
  handleClickMatchedCard: () => void;
  handleClickUnmatchedCard: () => void;
  handleClickDrop: () => void;
  handleGetComponentForm?: (x: string) => ReactNode;
}

export function MatchBox({
  id,
  practiceId,
  left,
  right,
  answer,
  active,
  solved,
  handleClickMatchedCard,
  handleClickUnmatchedCard,
  handleClickDrop,
  handleGetComponentForm,
}: MatchBoxProps) {
  const currentAnswer = useMemo(() => answer[practiceId], [answer, practiceId]);

  return (
    <div
      key={id}
      id={id}
      className="MatchBox w-full flex justify-between gap-4 mb-8"
    >
      <div className="Match_left flex items-center">
        <TeX>{left}</TeX>
        {currentAnswer ? (
          <MatchCard
            className="ml-8"
            onClick={handleClickMatchedCard}
            solved={solved}
          >
            <TeX>{currentAnswer}</TeX>
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
          "Match_right",
          !currentAnswer && "!bg-primary-2 rounded-sm",
          Object.values(answer).includes(right) && "invisible",
          active &&
            active.answer === right &&
            "!bg-primary-4 hover:bg-primary-5"
        )}
        onClick={handleClickUnmatchedCard}
      >
        <TeX>{right}</TeX>
      </MatchCard>
    </div>
  );
}

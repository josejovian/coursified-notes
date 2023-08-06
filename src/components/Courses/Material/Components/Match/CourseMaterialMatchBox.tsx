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
  handleClickMatchedCard,
  handleClickUnmatchedCard,
  handleClickDrop,
  handleGetComponentForm,
}: MatchBoxProps) {
  const currentAnswer = useMemo(() => answer[practiceId], [answer, practiceId]);

  const tex = useCallback((content: any) => <span>{content}</span>, []);

  // const handleMountFormula = useCallback(
  //   (parent: Element, index: number, content: JSX.Element) => {
  //     const identifier = `MatchCardFormula-${id}-${index}`;
  //     const existing = document.getElementById(identifier);

  //     if (existing) return;

  //     const vessel = document.createElement("div");
  //     vessel.id = identifier;

  //     // parent.nextSibling
  //     parent.insertBefore(vessel, null);

  //     ReactDOM.render(content, vessel);
  //   },
  //   [id]
  // );

  // const handleUnmountFormula = useCallback(
  //   (parent: Element, index: number) => {
  //     const identifier = `MatchCardFormula-${id}-${index}`;
  //     const existing = document.getElementById(identifier);

  //     if (!existing) return;

  //     if (parent.firstChild) parent.removeChild(parent.firstChild);
  //   },
  //   [id]
  // );

  // useEffect(() => {
  //   const identifier = `MatchCardFormula-${id}`;

  //   const leftElement = document.querySelector(`#${id} .Match_left`);
  //   const rightElement = document.querySelector(`#${id} .Match_right`);

  //   if (leftElement)
  //     handleMountFormula(
  //       leftElement,
  //       0,
  //       <TeX id={`${identifier}-0`}>{left}</TeX>
  //     );

  //   if (rightElement)
  //     handleMountFormula(
  //       rightElement,
  //       1,
  //       <TeX id={`${identifier}-1`}>{right}</TeX>
  //     );

  //   return () => {
  //     if (leftElement) handleUnmountFormula(leftElement, 0);

  //     if (rightElement) handleUnmountFormula(rightElement, 1);
  //   };
  // });

  return (
    <div
      key={id}
      id={id}
      className="MatchBox w-full flex justify-between gap-4 mb-8"
    >
      <div className="Match_left flex items-center">
        <TeX>{left}</TeX>
        {currentAnswer ? (
          <MatchCard className="ml-8" onClick={handleClickMatchedCard}>
            {currentAnswer}
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
          Object.values(answer).includes(right) && "hidden",
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

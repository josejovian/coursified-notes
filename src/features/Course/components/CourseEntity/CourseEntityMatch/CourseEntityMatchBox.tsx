import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import * as ReactDOM from "react-dom";
import clsx from "clsx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { MatchCard } from "./CourseEntityMatchCard";
import { MatchDrop } from "./CourseEntityMatchDrop";
import { AnswerType } from "@/type";

export interface MatchBoxProps {
  id: string;
  practiceId: string;
  left: string;
  right: string;
  answer: Partial<AnswerType>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
}: MatchBoxProps) {
  const leftRef = useRef<HTMLSpanElement>(null);
  const matchedRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const currentAnswer = useMemo(() => answer[practiceId], [answer, practiceId]);

  const handleReplaceHashtag = useCallback((string: string) => {
    return string.replaceAll("#", "$");
  }, []);

  const renderWrapper = useCallback(
    (children?: string) => {
      if (!children) return <></>;

      return (
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {handleReplaceHashtag(children)}
        </ReactMarkdown>
      );
    },
    [handleReplaceHashtag]
  );

  const handleRenderMarkdown = useCallback(() => {
    if (!leftRef.current || !matchedRef.current || !rightRef.current) return;
    if (!left || !currentAnswer || !right) return;

    ReactDOM.render(renderWrapper(left), leftRef.current);
    ReactDOM.render(renderWrapper(currentAnswer), matchedRef.current);
    ReactDOM.render(renderWrapper(right), rightRef.current);
  }, [currentAnswer, left, renderWrapper, right]);

  useEffect(() => {
    handleRenderMarkdown();
  }, [handleRenderMarkdown]);

  return (
    <div
      key={id}
      id={id}
      className="MatchBox w-full flex justify-between gap-4 mb-8"
    >
      <div className="Match_left flex items-center">
        {renderWrapper(left)}
        {currentAnswer ? (
          <MatchCard
            ref={matchedRef}
            className="ml-8"
            onClick={handleClickMatchedCard}
            solved={solved}
          >
            {renderWrapper(currentAnswer)}
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
        ref={rightRef}
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
        {renderWrapper(right)}
      </MatchCard>
    </div>
  );
}

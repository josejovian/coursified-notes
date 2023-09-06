import { MutableRefObject, useMemo } from "react";
import {
  ChapterAddressType,
  QuizAnswerType,
  QuizConfigType,
  QuizPhaseType,
  QuizQuestionType,
} from "@/src/type";
import clsx from "clsx";
import { CourseLayoutSideSection } from "../Layout/CourseLayoutSideSection";
import { CourseQuizListQuestion } from "./CourseQuizListQuestion";

interface CourseQuizListProps {
  chapterAddress?: ChapterAddressType;
  questions: MutableRefObject<Record<string, QuizQuestionType>>;
  quizPhase?: QuizPhaseType;
  quizAnswerSheet: Record<string, QuizAnswerType>;
  className?: string;
  disabled?: boolean;
  noBorder?: boolean;
  noPadding?: boolean;
  onClickQuestion?: (id: number) => void;
}

export function CourseQuizList({
  className,
  questions: refQuestions,
  quizPhase,
  quizAnswerSheet,
  disabled,
  onClickQuestion,
  noBorder,
  noPadding,
}: CourseQuizListProps) {
  const questions = Object.values(refQuestions.current);

  const answered = useMemo(() => {
    let count = 0;
    Object.values(quizAnswerSheet).forEach((answer) => {
      if (answer.answered) count++;
    });
    return count;
  }, [quizAnswerSheet]);

  return (
    <div
      className={clsx(
        "border-zinc-400",
        className,
        !noBorder && "border-t border-x"
      )}
    >
      <CourseLayoutSideSection
        title="Questions"
        caption={`${answered} / ${questions.length}`}
        noExpand
        noPadding
      >
        {questions.map((question, index) => {
          const { inputIds } = question;

          return (
            <CourseQuizListQuestion
              question={question}
              phase={quizPhase}
              answer={quizAnswerSheet[index + 1]}
              key={inputIds.join("")}
              index={index + 1}
              active={quizPhase === "submitted"}
              onClick={onClickQuestion}
              className={clsx(className, noPadding ? ROW_STYLE_2 : ROW_STYLE)}
            />
          );
        })}
      </CourseLayoutSideSection>
    </div>
  );
}

const ROW_STYLE = clsx(["py-4 pl-4 pr-8 md:pl-12 md:pr-16"]);
const ROW_STYLE_2 = clsx(["py-4 pl-4 pr-6 md:pl-8 md:pr-12"]);

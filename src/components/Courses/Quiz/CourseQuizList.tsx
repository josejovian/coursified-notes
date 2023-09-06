import { useMemo, MutableRefObject, useState, useEffect } from "react";
import {
  ChapterAddressType,
  CourseType,
  QuizPhaseType,
  QuizQuestionType,
  SectionType,
} from "@/src/type";
import clsx from "clsx";
import { CourseLayoutSideSection } from "../Layout/CourseLayoutSideSection";
import { CourseJourneySectionChapter } from "../Journey/CourseJourneySectionChapter";
import { CourseLayoutSideSectionChapter } from "../Layout/CourseLayoutSideSectionChapter";
import { CourseQuizListQuestion } from "./CourseQuizListQuestion";

interface CourseQuizListProps {
  chapterAddress?: ChapterAddressType;
  questions: MutableRefObject<Record<string, QuizQuestionType>>;
  quizPhase?: QuizPhaseType;
  quizAnswerSheet: any;
  title?: string;
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
  title,
  disabled,
  onClickQuestion,
  noBorder,
  noPadding,
}: CourseQuizListProps) {
  const questions = Object.values(refQuestions.current);

  return (
    <div
      className={clsx(
        "border-zinc-400",
        className,
        !noBorder && "border-t border-x"
      )}
    >
      <CourseLayoutSideSection title={`Quiz - ${title}`} noExpand noPadding>
        {questions.map((question, index) => {
          const { inputIds, weight } = question;
          const idx = index + 1;
          const status = (() => {
            if (!quizAnswerSheet || !quizAnswerSheet[idx]) return "unanswered";

            if (quizPhase === "submitted")
              return quizAnswerSheet[idx].correct ? "correct" : "incorrect";

            return quizAnswerSheet[idx].answered ? "answered" : "unanswered";
          })();

          return (
            <CourseQuizListQuestion
              key={inputIds.join("")}
              title={`Q${index + 1}`}
              caption={`${weight} pts`}
              index={index}
              status={status}
              active={quizPhase === "submitted"}
              onClick={() => {
                // onClickQuestion && onClickQuestion(index);
              }}
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

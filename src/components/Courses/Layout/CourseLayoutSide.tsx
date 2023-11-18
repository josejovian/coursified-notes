import { useState, useEffect, useMemo, useRef, MutableRefObject } from "react";
import {
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizAnswerType,
  QuizConfigType,
  QuizPhaseType,
  QuizQuestionType,
  StateType,
} from "@/src/type";
import clsx from "clsx";
import Link from "next/link";
import {
  Button,
  CourseJourney,
  Paragraph,
  Icon,
  CourseQuizList,
  IconText,
} from "@/src/components";
import { useScreen } from "@/src/hooks";
import Image from "next/image";
import { MdChevronLeft } from "react-icons/md";
import { getHMS } from "@/src/utils/date";
import { CourseQuizTimer } from "../Quiz/CourseQuizTimer";
import { BsFillClockFill } from "react-icons/bs";

interface SideProps {
  courseDetail: CourseType;
  chapterAddress: ChapterAddressType;
  quizDetails?: QuizConfigType;
  quizAnswerSheetRef?: MutableRefObject<QuizAnswerSheetType>;
  quizQuestions?: MutableRefObject<Record<string, QuizQuestionType>>;
  quizPhase?: QuizPhaseType;
  trueLoading?: boolean;
  stateProblemCount?: StateType<number>;
  onQuizBack?: () => void;
  onQuizNoTimeLeft?: () => void;
}

export function CourseLayoutSide({
  courseDetail,
  chapterAddress,
  quizQuestions,
  quizDetails,
  quizAnswerSheetRef,
  stateProblemCount,
  quizPhase,
  trueLoading,
}: SideProps) {
  const showQuizQuestions =
    quizDetails &&
    quizQuestions &&
    quizAnswerSheetRef &&
    quizPhase &&
    quizPhase !== "onboarding";

  console.warn("Rerender Side Element: ");
  console.warn(quizQuestions?.current);

  return (
    <>
      {showQuizQuestions ? (
        <CourseQuizList
          questions={quizQuestions}
          quizPhase={quizPhase}
          quizAnswerSheetRef={quizAnswerSheetRef}
          onClickQuestion={(id) =>
            document.getElementById(`q${id}`)?.scrollIntoView()
          }
          disabled={trueLoading}
          noBorder
          noPadding
        />
      ) : (
        <CourseJourney
          course={courseDetail}
          chapterAddress={chapterAddress}
          disabled={trueLoading}
          noBorder
          noPadding
        />
      )}
    </>
  );
}

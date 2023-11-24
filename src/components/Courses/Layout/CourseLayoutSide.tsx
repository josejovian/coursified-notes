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
} from "@/type";
import clsx from "clsx";
import Link from "next/link";
import {
  Button,
  CourseJourney,
  Paragraph,
  Icon,
  CourseQuizList,
  IconText,
} from "@/components";
import { useScreen } from "@/hooks";
import Image from "next/image";
import { MdChevronLeft } from "react-icons/md";
import { getHMS } from "@/utils/date";
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
  onQuizBack?: () => void;
  onQuizNoTimeLeft?: () => void;
}

export function CourseLayoutSide({
  courseDetail,
  chapterAddress,
  quizQuestions,
  quizDetails,
  quizAnswerSheetRef,
  quizPhase,
  trueLoading,
}: SideProps) {
  const showQuizQuestions =
    quizDetails &&
    quizQuestions &&
    quizAnswerSheetRef &&
    quizPhase &&
    quizPhase !== "onboarding";

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
          scrollable
        />
      )}
    </>
  );
}

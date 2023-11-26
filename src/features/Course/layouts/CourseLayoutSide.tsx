import { MutableRefObject } from "react";
import { CourseJourney, CourseQuizList } from "@/components";
import {
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizConfigType,
  QuizPhaseType,
  QuizQuestionType,
} from "@/type";

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

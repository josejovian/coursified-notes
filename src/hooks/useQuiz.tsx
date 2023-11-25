import { useMemo, useRef } from "react";
import {
  AnswerType,
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizAnswerType,
  QuizConfigType,
  QuizQuestionType,
} from "../type";

interface useQuizProps {
  courseDetail: CourseType;
  chapterAddress: ChapterAddressType;
  answer: Partial<AnswerType>;
  accept: Partial<AnswerType>;
}

export function useQuiz({
  courseDetail,
  chapterAddress,
  answer,
  accept,
}: useQuizProps) {
  const quizAnswerSheetRef = useRef<QuizAnswerSheetType>({
    answers: {},
    summary: {},
    questions: {},
  });

  const quizDetails = useMemo(() => {
    const currentSection = courseDetail.sections[chapterAddress.sectionIndex!];

    return chapterAddress.chapter === "quiz"
      ? ({
          ...currentSection.quiz,
          title: currentSection.title,
        } as QuizConfigType)
      : undefined;
  }, [chapterAddress, courseDetail.sections]);

  const quizQuestions = useRef<Record<string, QuizQuestionType>>({});

  const quizAnswers = useMemo(() => {
    if (!quizDetails) return undefined;

    const individualQuestions = Object.entries(quizQuestions.current)
      .map(([key, value]) => {
        let answered = true;
        let correct = true;

        const relatedInputs = value.inputIds.reduce((prev, curr) => {
          if (!answer[curr]) answered = false;
          if (!answer[curr] || answer[curr] !== accept[curr]) correct = false;

          return {
            ...prev,
            [curr]: answer[curr],
          };
        }, {});
        const relatedKeys = value.inputIds.reduce((prev, curr) => {
          return {
            ...prev,
            [curr]: accept[curr],
          };
        }, {});

        return [
          key,
          {
            answers: relatedInputs,
            accept: relatedKeys,
            answered,
            correct,
            points: correct ? value.weight : 0,
          } as QuizAnswerType,
        ];
      })
      .reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prev, [key, value]: any) => ({
          ...prev,
          [key]: value,
        }),
        {}
      );

    return individualQuestions as Record<string, QuizAnswerType>;
  }, [accept, answer, quizDetails]);

  return useMemo(
    () => ({
      quizDetails,
      quizQuestions,
      quizAnswerSheetRef,
      quizAnswers,
    }),
    [quizDetails, quizAnswerSheetRef, quizAnswers]
  );
}

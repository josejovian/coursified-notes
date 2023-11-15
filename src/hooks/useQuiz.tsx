import { useMemo, useRef, useState } from "react";
import {
  AnswerType,
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizAnswerType,
  QuizConfigType,
  QuizPhaseType,
  QuizQuestionType,
  StateType,
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
  const stateQuizAnswerSheet = useState<QuizAnswerSheetType>();
  const [quizAnswerSheet, setQuizAnswerSheet] = stateQuizAnswerSheet;

  const quizDetails = useMemo<QuizConfigType | undefined>(() => {
    const currentSection = courseDetail.sections[chapterAddress.sectionIndex!];

    return chapterAddress.chapter === "quiz"
      ? ({
          ...currentSection.quiz,
          title: currentSection.title,
        } as any)
      : undefined;
  }, [chapterAddress, courseDetail.sections]);

  const quizQuestions = useRef<Record<string, QuizQuestionType>>({});

  const quizAnswers = useMemo(() => {
    if (!quizDetails) return undefined;

    const individualQuestions = Object.entries(quizQuestions.current)
      .map(([key, value]) => {
        let answered = true;
        let correct = true;

        let relatedInputs = value.inputIds.reduce((prev, curr) => {
          if (!answer[curr]) answered = false;
          if (!answer[curr] || answer[curr] !== accept[curr]) correct = false;

          return {
            ...prev,
            [curr]: answer[curr],
          };
        }, {});
        let relatedKeys = value.inputIds.reduce((prev, curr) => {
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
      stateQuizAnswerSheet: [
        {
          ...quizAnswerSheet,
          answers: quizAnswers,
        },
        setQuizAnswerSheet,
      ] as StateType<QuizAnswerSheetType>,
      quizAnswers,
    }),
    [quizDetails, quizAnswerSheet, quizAnswers, setQuizAnswerSheet]
  );
}

import { ToastType } from "../type";

export const TOAST_PHRASE: Record<ToastPhraseType, Partial<ToastType>> = {
  courseMaterialPracticeAnsweredCorrect: {
    variant: "success",
    message: "Correct answer!",
  },
  courseMaterialPracticeAnsweredIncorrect: {
    variant: "warning",
    message: "At least one answer is incorrect.",
  },
  courseQuizContinueFromBackUp: {
    variant: "information",
    message: "Resuming existing quiz session.",
  },
  courseQuizForceSubmit: {
    variant: "warning",
    message: "Your answers are submitted as the time ran out.",
  },
};

export type ToastPhraseType =
  | "courseMaterialPracticeAnsweredCorrect"
  | "courseMaterialPracticeAnsweredIncorrect"
  | "courseQuizContinueFromBackUp"
  | "courseQuizForceSubmit";

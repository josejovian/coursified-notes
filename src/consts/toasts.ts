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
};

export type ToastPhraseType =
  | "courseMaterialPracticeAnsweredCorrect"
  | "courseMaterialPracticeAnsweredIncorrect";

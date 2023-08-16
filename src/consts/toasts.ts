import { ToastType } from "../type";

export const TOAST_PHRASE: Record<ToastPhraseType, ToastType> = {
  courseMaterialPracticeAnsweredCorrect: {
    variant: "success",
    message: "Practice solved.",
  },
  courseMaterialPracticeAnsweredIncorrect: {
    variant: "warning",
    message: "At least one answer is incorrect.",
  },
};

export type ToastPhraseType =
  | "courseMaterialPracticeAnsweredCorrect"
  | "courseMaterialPracticeAnsweredIncorrect";

import { Dispatch, SetStateAction } from "react";

export type StateType<T> = [T, Dispatch<SetStateAction<T>>];

export type Common<X, Y> = {
  [key in keyof X]: key extends keyof Y ? X[key] : never;
} & { [key in keyof Y]: key extends keyof X ? Y[key] : never };

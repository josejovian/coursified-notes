import { Dispatch, SetStateAction } from "react";

export type StateType<T> = [T, Dispatch<SetStateAction<T>>];

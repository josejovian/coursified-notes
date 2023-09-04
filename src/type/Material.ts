import { ChapterAddressType } from "./Course";

export const CUSTOM_MATERIAL = {
  input: "InputBox",
  match: "MatchBox",
  option: "Option",
};

export type CustomMaterialType = keyof typeof CUSTOM_MATERIAL;

export type AnswerType = { [key: string]: string };

export type AddressesType = {
  [key: string]: ChapterAddressType;
};

export type InputBoxElementType = {
  parentElement: HTMLElement;
  string: string;
};

export type MatchBoxElementType = {
  parentElement: HTMLElement;
  pair: [string, string];
  id: string;
};

export type OptionElementType = {
  parentElement: HTMLElement;
  content: string;
  truth: number;
  choiceIndex: number;
  id: string;
};

export type GraphElementType = {
  parentElement: HTMLElement;
  functions: string;
  points: string;
  ranges: string;
  asymptotes: string;
  gridSize: string;
  id: string;
};

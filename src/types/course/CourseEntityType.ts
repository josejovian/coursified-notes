import { ChapterAddressType } from "./CourseType";

export const CUSTOM_MATERIAL = {
  input: "InputBox",
  match: "MatchBox",
  option: "Option",
};

export type CustomMaterialType = keyof typeof CUSTOM_MATERIAL;

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

export interface MathFunction {
  func: (x: number) => number;
  color: GraphColors;
}

export interface MathPoint {
  points: [number, number];
  color?: GraphColors;
  variant?: PointVariants;
}

export interface MathAsymptote {
  type: "x" | "y";
  value: number;
}

export type GraphGridSize = "md" | "sm";

export type GraphColors = "purple" | "blue" | "green" | "red" | "orange";

export type PointVariants = "solid" | "outline";

export interface GraphParams {
  up: number;
  down: number;
  left: number;
  right: number;
  horizontal: number;
  vertical: number;
  width: number;
  height: number;
  increments: [number, number];
  borderSize: number;
  gridSize: [number, number];
  gridSizeCategory: GraphGridSize;
  arrowSize: number;
  color: GraphColors;
}

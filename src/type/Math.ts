export interface MathFunction {
  func: (x: number) => number;
  color: GraphColors;
}

export interface MathPoint {
  points: [number, number];
  variant?: string;
}

export interface MathAsymptote {
  type: "x" | "y";
  value: number;
}

export type GraphColors = "purple" | "blue" | "green" | "red" | "orange";

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
  arrowSize: number;
  color: GraphColors;
}

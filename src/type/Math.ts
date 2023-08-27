export type MathFunction = (x: number) => number;

export interface MathPoint {
  points: [number, number];
  variant?: string;
}

export type GraphColors = "purple" | "blue" | "green" | "red";

export interface GraphParams {
  up: number;
  down: number;
  left: number;
  right: number;
  horizontal: number;
  vertical: number;
  width: number;
  height: number;
  borderSize: number;
  gridSize: number;
  arrowSize: number;
  color: GraphColors;
}

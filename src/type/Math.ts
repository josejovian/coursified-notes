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

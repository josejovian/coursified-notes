import { GraphColors, GraphGridSize, PointVariants } from "../type";

export const GRAPH_COLORS: Record<GraphColors, string> = {
  red: "#ef4444",
  blue: "#0ea5e9",
  green: "#34d399",
  purple: "#8b5cf6",
  orange: "#f97316",
};

export const POINT_VARIANTS = ["outline", "solid"] as PointVariants[];

export const GRAPH_OUTER_BORDER = 4;

export const GRAPH_GRID_SIZE: Record<GraphGridSize, number> = {
  md: 32,
  sm: 24,
};
export const GRAPH_ARROW_SIZE = 8;

export const GRAPH_FONT_SIZE = 16;

export const GRAPH_RANGES = [5, 5, -5, -5];

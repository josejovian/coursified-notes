import React from "react";
import TeX from "@matejmazur/react-katex";
import { GRAPH_FONT_SIZE } from "@/consts";
import { GraphParams } from "@/type";

export interface CourseEntityGraphAxesProps {
  params: GraphParams;
  functions: string;
}

export function CourseEntityGraphAxes({
  params,
  functions,
}: CourseEntityGraphAxesProps) {
  const {
    gridSize,
    up,
    borderSize,
    horizontal,
    left,
    gridSizeCategory,
    width,
  } = params;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: gridSize[0] * up + borderSize * 3,
          left: borderSize,
        }}
      >
        {Array.from({ length: horizontal }, () => 0).map((_, idx) => {
          const xValue = idx + left;

          const hidden = idx === 0 || xValue === -1 || xValue === 0;

          return (
            <TeX
              style={{
                display: hidden ? "none" : "initial",
                width: `${GRAPH_FONT_SIZE}px`,
                textAlign: "right",
                position: "absolute",
                left:
                  (idx - 1) * gridSize[1] +
                  (gridSizeCategory === "md" ? 12 : 4) +
                  (xValue > 0 ? 8 : 0),
              }}
              key={`GraphX_${functions}_${idx}`}
            >{`${xValue}`}</TeX>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: borderSize,
          left:
            gridSize[1] * (Math.abs(left) - 1) -
            (gridSizeCategory === "md" ? 0 : 12),
        }}
      >
        {Array.from({ length: horizontal }, () => 0).map((_, idx) => {
          const yValue = up - idx;

          const hidden = idx === 0 || yValue === -1 || yValue === 0;

          return (
            <TeX
              style={{
                display: hidden ? "none" : "initial",
                width: `${GRAPH_FONT_SIZE}px`,
                textAlign: "right",
                position: "absolute",
                top: idx * gridSize[0] - 12,
              }}
              key={`GraphY_${functions}_${idx}`}
            >{`${yValue}`}</TeX>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: gridSize[0] * up - 8,
          left: 3 * borderSize + width,
        }}
      >
        <TeX>x</TeX>
      </div>
      <div
        style={{
          position: "absolute",
          top: -6 * borderSize,
          left: Math.abs(left) * gridSize[1],
        }}
      >
        <TeX>y</TeX>
      </div>
    </>
  );
}

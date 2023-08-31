import JXG from "jsxgraph";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  GraphParams,
  MathAsymptote,
  MathFunction,
  MathPoint,
} from "@/src/type";
import {
  drawGraphAxes,
  drawGraphAxesArrows,
  drawGraphFunction,
  drawGraphAxesMarker,
  drawGraphGrids,
  drawGraphPoints,
  drawGraphAsymptotes,
  parseSourceFunctions,
  parseSourcePoints,
} from "@/src/utils";
import TeX from "@matejmazur/react-katex";
import clsx from "clsx";

type GraphGridSize = "md" | "sm";

interface GraphProps {
  id: string;
  functions?: string;
  funcs?: any;
  points?: string;
  ranges?: string;
  increments?: string;
  hideGrid?: boolean;
  asymptotes: string;
  gridSize?: "md" | "sm";
  mounted?: boolean;
  cache?: string;
  onReady?: (data: string) => void;
}

const GRAPH_OUTER_BORDER = 4;
const GRAPH_GRID_SIZE: Record<GraphGridSize, number> = {
  md: 32,
  sm: 24,
};
const GRAPH_ARROW_SIZE = 8;
const GRAPH_RANGES = [5, 5, -5, -5];

export const Graph = ({
  id,
  functions = "",
  points = "",
  ranges = "[5,5,-5,-5]",
  increments = "",
  hideGrid,
  asymptotes = "",
  gridSize: ovverrideGridSize = "sm",
  mounted,
  cache,
  onReady,
}: GraphProps) => {
  const [image, setImage] = useState(cache);

  const parsedBounds = useMemo<[number, number, number, number]>(() => {
    if (!ranges || ranges === "") return GRAPH_RANGES;

    const parsed = JSON.parse(ranges);

    if (parsed && parsed.length === 4) return parsed;
    return GRAPH_RANGES;
  }, [ranges]);
  const [up, right, down, left] = parsedBounds;

  const parsedIncrements = useMemo<[number, number]>(() => {
    if (!increments || increments === "") return [1, 1];

    const parsed = JSON.parse(increments).split(",");

    if (parsed.length === 2) return parsed as [number, number];

    return [1, 2];
  }, [increments]);

  const graphParams = useMemo<GraphParams>(() => {
    const vertical = Math.abs(up) + Math.abs(down);
    const horizontal = Math.abs(right) + Math.abs(left);
    const gridXSize = GRAPH_GRID_SIZE[ovverrideGridSize] * parsedIncrements[1];
    const gridYSize = GRAPH_GRID_SIZE[ovverrideGridSize] * parsedIncrements[0];

    return {
      arrowSize: GRAPH_ARROW_SIZE,
      borderSize: GRAPH_OUTER_BORDER,
      down,
      height: vertical * gridYSize,
      width: horizontal * gridXSize,
      gridSize: [gridYSize, gridXSize],
      horizontal,
      left,
      right,
      up,
      vertical,
      color: "orange",
      increments: parsedIncrements,
    };
  }, [down, left, ovverrideGridSize, parsedIncrements, right, up]);
  const {
    arrowSize,
    borderSize,
    gridSize,
    height,
    horizontal,
    vertical,
    width,
  } = graphParams;

  const [loading, setLoading] = useState(true);
  const initializeRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const parsedAsymptotes = useMemo<MathAsymptote[]>(
    () =>
      asymptotes.split(",").map((instance) => {
        return {
          type: instance.startsWith("y=") ? "y" : "x",
          value: Number(instance.slice(2)),
        };
      }),
    [asymptotes]
  );

  const handleDrawGraphTemplates = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGraphAxesMarker(ctx, graphParams);
    drawGraphAxes(ctx, graphParams);
    drawGraphAxesArrows(ctx, graphParams);
  }, [graphParams]);

  const handleDrawGraph = useCallback(
    (directFunctions: MathFunction[], directPoints: MathPoint[]) => {
      if (!loading) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (initializeRef.current) return;

      initializeRef.current = true;

      if (!hideGrid) drawGraphGrids(ctx, graphParams);

      handleDrawGraphTemplates();
      drawGraphFunction(ctx, graphParams, directFunctions);
      drawGraphPoints(ctx, graphParams, directPoints);
      drawGraphAsymptotes(ctx, graphParams, parsedAsymptotes);
      ctx.save();

      setLoading(false);

      const graph = canvas.toDataURL("image/png");
      onReady && onReady(graph);
      setImage(graph);
    },
    [
      graphParams,
      handleDrawGraphTemplates,
      hideGrid,
      loading,
      onReady,
      parsedAsymptotes,
    ]
  );

  const handleInitialize = useCallback(() => {
    if (cache) return;
    handleDrawGraphTemplates();
    const parsedFunctions = parseSourceFunctions(functions, [left, right]);
    const parsedPoints = parseSourcePoints(points);
    handleDrawGraph(parsedFunctions, parsedPoints);
  }, [
    cache,
    handleDrawGraphTemplates,
    functions,
    left,
    right,
    points,
    handleDrawGraph,
  ]);

  useEffect(() => {
    handleInitialize();
  }, [handleInitialize]);

  const fontSize = useMemo(() => GRAPH_GRID_SIZE["md"] - 8, []);

  const renderGraphNumbers = useMemo(
    () => (
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

            if (idx === 0 || xValue === -1 || xValue === 0) return <></>;

            return (
              <TeX
                style={{
                  width: `${fontSize}px`,
                  textAlign: "right",
                  position: "absolute",
                  left:
                    (idx - 1) * gridSize[1] +
                    (ovverrideGridSize === "md" ? 12 : 4),
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
              (ovverrideGridSize === "md" ? 0 : 12),
          }}
        >
          {Array.from({ length: horizontal }, () => 0).map((_, idx) => {
            const yValue = up - idx;

            if (idx === 0 || yValue === -1 || yValue === 0) return <></>;

            return (
              <TeX
                style={{
                  width: `${fontSize}px`,
                  textAlign: "right",
                  position: "absolute",
                  top: idx * gridSize[0] - 12,
                }}
                key={`GraphY_${functions}_${idx}`}
              >{`${yValue}`}</TeX>
            );
          })}
        </div>
      </>
    ),
    [
      borderSize,
      fontSize,
      functions,
      gridSize,
      horizontal,
      left,
      ovverrideGridSize,
      up,
    ]
  );

  const renderGraphAxesCaption = useMemo(
    () => (
      <>
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
    ),
    [borderSize, gridSize, left, up, width]
  );

  return (
    <div className="Graph relative w-fit mx-auto select-none">
      <canvas
        className={clsx("invisible")}
        ref={canvasRef}
        id={id}
        width={width + 8}
        height={height + 8}
      ></canvas>
      <div
        className="absolute top-0 bg-gray-50"
        style={{ width: width + 8, height: height + 8 }}
      />
      {image && (
        <>
          <img
            className="!absolute !top-0"
            src={image}
            draggable={false}
            alt={`Graph ${functions}`}
          />
          {renderGraphNumbers}
          {renderGraphAxesCaption}
        </>
      )}
    </div>
  );
};

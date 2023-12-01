import { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
  parseSourceAsymptotes,
} from "@/utils";
import {
  GRAPH_ARROW_SIZE,
  GRAPH_GRID_SIZE,
  GRAPH_OUTER_BORDER,
  GRAPH_RANGES,
} from "@/consts";
import { GraphGridSize, GraphParams } from "@/types";
import { CourseEntityGraphAxes } from "./CourseEntityGraphAxes";

interface GraphProps {
  id: string;
  functions?: string;
  points?: string;
  ranges?: string;
  increments?: string;
  hideGrid?: boolean;
  asymptotes: string;
  gridSize?: GraphGridSize;
  cache?: string;
  onReady?: (data: string) => void;
}

export const Graph = ({
  id,
  functions = "",
  points = "",
  ranges = "[5,5,-5,-5]",
  increments = "",
  hideGrid,
  asymptotes = "",
  gridSize: ovverrideGridSize = "sm",
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
      gridSizeCategory: ovverrideGridSize,
      horizontal,
      left,
      right,
      up,
      vertical,
      color: "orange",
      increments: parsedIncrements,
    };
  }, [down, left, ovverrideGridSize, parsedIncrements, right, up]);

  const { height, width } = graphParams;

  const [loading, setLoading] = useState(true);
  const initializeRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDrawGraphTemplates = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGraphAxesMarker(ctx, graphParams);
    drawGraphAxes(ctx, graphParams);
    drawGraphAxesArrows(ctx, graphParams);
  }, [graphParams]);

  const handleDrawGraph = useCallback(() => {
    const parsedFunctions = parseSourceFunctions(functions, [left, right]);
    const parsedPoints = parseSourcePoints(points);
    const parsedAsymptotes = parseSourceAsymptotes(asymptotes);

    if (!loading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (initializeRef.current) return;

    initializeRef.current = true;

    if (!hideGrid) drawGraphGrids(ctx, graphParams);

    handleDrawGraphTemplates();
    drawGraphFunction(ctx, graphParams, parsedFunctions);
    drawGraphPoints(ctx, graphParams, parsedPoints);
    drawGraphAsymptotes(ctx, graphParams, parsedAsymptotes);
    ctx.save();

    setLoading(false);

    const graph = canvas.toDataURL("image/png");
    onReady && onReady(graph);
    setImage(graph);
  }, [
    asymptotes,
    functions,
    graphParams,
    handleDrawGraphTemplates,
    hideGrid,
    left,
    loading,
    onReady,
    points,
    right,
  ]);

  const handleInitialize = useCallback(() => {
    if (cache) return;
    handleDrawGraphTemplates();
    handleDrawGraph();
  }, [cache, handleDrawGraphTemplates, handleDrawGraph]);

  useEffect(() => {
    handleInitialize();
  }, [handleInitialize]);

  const imageSource = useMemo(
    () =>
      image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="!absolute !top-0"
          src={image}
          draggable={false}
          alt={`Graph ${functions}`}
        />
      ) : (
        <></>
      ),
    [functions, image]
  );
  return (
    <div className="Graph relative w-fit mx-auto select-none">
      <canvas
        className="invisible"
        ref={canvasRef}
        id={id}
        width={width + 8}
        height={height + 8}
      ></canvas>
      <div
        className="absolute top-0 bg-gray-50"
        style={{ width: width + 8, height: height + 8 }}
      />
      {imageSource}
      <CourseEntityGraphAxes functions={functions} params={graphParams} />
    </div>
  );
};

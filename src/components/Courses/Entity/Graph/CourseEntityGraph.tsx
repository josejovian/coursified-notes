import JXG from "jsxgraph";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  createRef,
} from "react";
import { GraphParams, MathFunction, MathPoint } from "@/src/type";
import {
  drawGraphAxes,
  drawGraphAxesArrows,
  drawGraphFunction,
  drawGraphAxesMarker,
  drawGraphGrids,
  drawGraphPoints,
  evaluateMath,
} from "@/src/utils";
import { useSwapPage } from "@/src/hooks";
import TeX from "@matejmazur/react-katex";

interface GraphProps {
  id: string;
  functions?: string;
  funcs?: any;
  points?: string;
  ranges?: [number, number, number, number];
  hideGrid?: boolean;
}

interface FunctionType {
  function: (x: number) => number;
  bounds?: [number, number];
  color?: string;
}

const GRAPH_OUTER_BORDER = 4;
const GRAPH_GRID_SIZE = 32;
const GRAPH_ARROW_SIZE = 8;

export default function Graph({
  id,
  functions = "",
  points = "",
  ranges = [5, 5, -5, -5], //up right down left
  hideGrid,
}: GraphProps) {
  const [up, right, down, left] = ranges;

  const graphParams = useMemo<GraphParams>(() => {
    const vertical = Math.abs(up) + Math.abs(down);
    const horizontal = Math.abs(right) + Math.abs(left);
    return {
      arrowSize: GRAPH_ARROW_SIZE,
      borderSize: GRAPH_OUTER_BORDER,
      down,
      gridSize: GRAPH_GRID_SIZE,
      height: vertical * 32,
      width: horizontal * 32,
      horizontal,
      left,
      right,
      up,
      vertical,
      color: "orange",
    };
  }, [down, left, right, up]);
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
  const [build, setBuild] = useState(false);
  const [success, setSuccess] = useState(false);
  const [funcs, setFuncs] = useState<MathFunction[]>([]);
  const [pts, setPts] = useState<MathPoint[]>([]);
  const stateSwapPages = useSwapPage();
  const [swapPages, setSwapPages] = stateSwapPages;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const xAxisRef = useRef<HTMLDivElement>(null);
  const yAxisRef = useRef<HTMLDivElement>(null);

  const parsedFunctions = useMemo(
    () => functions.replace("function:", "").split(";"),
    [functions]
  );

  const parsedPoints = useMemo(
    () => points.replace("point:", "").split(";"),
    [points]
  );

  const handleInitializeFunctions = useCallback(() => {
    const convertedFunctions = parsedFunctions.map((f: string) => {
      const parsed = f.split("@");
      if (parsed.length !== 2) {
        return (x: number) => {
          const value = evaluateMath(f.replace(/x/g, `(${x})`));
          return value;
        };
      }

      const [strFunc, strBounds] = parsed;
      const bounds = strBounds
        .split("")
        .filter((_, idx) => idx > 0 && idx < strBounds.length - 1)
        .join("")
        .split(",")
        .map((num) => Number(num));
      const [left, right] = bounds;

      return (x: number) => {
        if (x < left || x > right) return NaN;

        const value = evaluateMath(strFunc.replace(/x/g, `(${x})`));
        return value;
      };
    });

    setFuncs(convertedFunctions);
  }, [parsedFunctions]);

  const handleInitializePoints = useCallback(() => {
    const convertedPoints: MathPoint[] = [];
    parsedPoints.forEach((point) => {
      const parse = point.split("-");
      if (parse.length === 2) {
        const variant = parse[1];
        const coords = parse[0].split(",").map((x) => Number(x));
        const [y, x] = coords;
        if (coords.length === 2) {
          convertedPoints.push({
            points: [y, x],
            variant: variant ?? "solid",
          });
        }
      }
    });

    console.log("Points:");
    console.log(convertedPoints);

    setPts(convertedPoints);
  }, [parsedPoints]);

  const handleInitializeGraph = useCallback(() => {
    if (!loading) return;
    if (!document.getElementById(id)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!hideGrid) drawGraphGrids(ctx, graphParams);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    drawGraphAxesMarker(ctx, graphParams);
    drawGraphAxes(ctx, graphParams);
    drawGraphAxesArrows(ctx, graphParams);
    drawGraphFunction(ctx, graphParams, funcs);
    drawGraphPoints(ctx, graphParams, pts);

    if (build) setLoading(false);
  }, [build, funcs, graphParams, hideGrid, id, loading, pts]);

  const handleInitialize = useCallback(() => {
    handleInitializeFunctions();
    handleInitializePoints();
    setBuild(true);
  }, [handleInitializeFunctions, handleInitializePoints]);

  useEffect(() => {
    handleInitialize();
  }, [handleInitialize]);

  useEffect(() => {
    handleInitializeGraph();
  }, [build, handleInitializeGraph]);

  const renderGraphNumbers = useMemo(
    () => (
      <>
        <div
          style={{
            position: "absolute",
            top: 32 * up + borderSize * 3,
            left: borderSize,
          }}
          ref={xAxisRef}
        >
          {Array.from({ length: horizontal }, () => 0).map((_, idx) => {
            const xValue = idx + left;

            if (idx === 0 || xValue === -1 || xValue === 0) return <></>;

            return (
              <TeX
                style={{
                  width: "24px",
                  textAlign: "right",
                  position: "absolute",
                  left: (idx - 1) * gridSize + 12,
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
            left: 32 * (Math.abs(left) - 1),
          }}
          ref={xAxisRef}
        >
          {Array.from({ length: horizontal }, () => 0).map((_, idx) => {
            const yValue = up - idx;

            if (idx === 0 || yValue === -1 || yValue === 0) return <></>;

            return (
              <TeX
                style={{
                  width: "24px",
                  textAlign: "right",
                  position: "absolute",
                  top: idx * gridSize - 12,
                }}
                key={`GraphY_${functions}_${idx}`}
              >{`${yValue}`}</TeX>
            );
          })}
        </div>
      </>
    ),
    [borderSize, functions, gridSize, horizontal, left, up]
  );

  const renderGraphAxesCaption = useMemo(
    () => (
      <>
        <div
          style={{
            position: "absolute",
            top: 32 * up - 8,
            left: 3 * borderSize + width,
          }}
        >
          <TeX>x</TeX>
        </div>
        <div
          style={{
            position: "absolute",
            top: -6 * borderSize,
            left: Math.abs(left) * 32,
          }}
        >
          <TeX>y</TeX>
        </div>
      </>
    ),
    [borderSize, left, up, width]
  );

  return (
    <div className="relative w-fit mx-auto">
      <canvas
        ref={canvasRef}
        id={id}
        width={width + 8}
        height={height + 8}
      ></canvas>
      {renderGraphNumbers}
      {renderGraphAxesCaption}
    </div>
  );
}

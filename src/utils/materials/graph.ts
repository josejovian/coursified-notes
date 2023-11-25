import {
  GraphParams,
  MathAsymptote,
  MathFunction,
  MathPoint,
  GraphColors,
  PointVariants,
} from "@/type";
import { GRAPH_COLORS, POINT_VARIANTS } from "@/consts";
import { evaluateMath } from "../evaluateMath";

export function drawGraphAxes(
  ctx: CanvasRenderingContext2D,
  params: GraphParams
) {
  const { width, height, left, up, gridSize, borderSize } = params;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(borderSize, Math.abs(up) * gridSize[0] + borderSize);
  ctx.lineTo(borderSize + width, Math.abs(up) * gridSize[0] + borderSize);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(Math.abs(left) * gridSize[1] + borderSize, borderSize);
  ctx.lineTo(Math.abs(left) * gridSize[1] + borderSize, borderSize + height);
  ctx.stroke();
}

export function drawGraphAxesArrows(
  ctx: CanvasRenderingContext2D,
  params: GraphParams
) {
  const { up, left, height, width, arrowSize, borderSize, gridSize } = params;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(borderSize, Math.abs(up) * gridSize[0] + borderSize);
  ctx.lineTo(
    borderSize + arrowSize,
    Math.abs(up) * gridSize[0] + borderSize + arrowSize
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(borderSize, Math.abs(up) * gridSize[0] + borderSize);
  ctx.lineTo(
    borderSize + arrowSize,
    Math.abs(up) * gridSize[0] + borderSize - arrowSize
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(borderSize + width, Math.abs(up) * gridSize[0] + borderSize);
  ctx.lineTo(
    borderSize + width - arrowSize,
    Math.abs(up) * gridSize[0] + borderSize - arrowSize
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(borderSize + width, Math.abs(up) * gridSize[0] + borderSize);
  ctx.lineTo(
    borderSize + width - arrowSize,
    Math.abs(up) * gridSize[0] + borderSize + arrowSize
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(borderSize + Math.abs(left) * gridSize[1], borderSize);
  ctx.lineTo(
    borderSize + Math.abs(left) * gridSize[1] - arrowSize,
    borderSize + arrowSize
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(borderSize + Math.abs(left) * gridSize[1], borderSize);
  ctx.lineTo(
    borderSize + Math.abs(left) * gridSize[1] + arrowSize,
    borderSize + arrowSize
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(borderSize + Math.abs(left) * gridSize[1], borderSize + height);
  ctx.lineTo(
    borderSize + Math.abs(left) * gridSize[1] - arrowSize,
    borderSize + height - arrowSize
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(borderSize + Math.abs(left) * gridSize[1], borderSize + height);
  ctx.lineTo(
    borderSize + Math.abs(left) * gridSize[1] + arrowSize,
    borderSize + height - arrowSize
  );
  ctx.stroke();
}

export function drawGraphAxesMarker(
  ctx: CanvasRenderingContext2D,
  params: GraphParams
) {
  const { up, borderSize, gridSize, left, vertical, horizontal } = params;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  for (let i = 1; i < horizontal; i++) {
    ctx.beginPath();
    ctx.moveTo(
      Math.abs(left) * gridSize[1] - borderSize,
      borderSize + i * gridSize[0]
    );
    ctx.lineTo(
      Math.abs(left) * gridSize[1] + 3 * borderSize,
      borderSize + i * gridSize[0]
    );
    ctx.stroke();
  }

  for (let i = 1; i < vertical; i++) {
    ctx.beginPath();
    ctx.moveTo(
      borderSize + i * gridSize[1],
      Math.abs(up) * gridSize[0] - borderSize
    );
    ctx.lineTo(
      borderSize + i * gridSize[1],
      Math.abs(up) * gridSize[0] + 3 * borderSize
    );
    ctx.stroke();
  }
}

export function drawGraphGrids(
  ctx: CanvasRenderingContext2D,
  params: GraphParams
) {
  const { vertical, height, horizontal, width, borderSize, gridSize } = params;

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  for (let i = 0; i <= vertical; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize[1] + borderSize, 0 + borderSize);
    ctx.lineTo(i * gridSize[1] + borderSize, height + borderSize);
    ctx.stroke();
  }
  for (let i = 0; i <= horizontal; i++) {
    ctx.beginPath();
    ctx.moveTo(borderSize, i * gridSize[0] + borderSize);
    ctx.lineTo(borderSize + width, i * gridSize[0] + borderSize);
    ctx.stroke();
  }
}

export function drawGraphFunction(
  ctx: CanvasRenderingContext2D,
  params: GraphParams,
  funcs: MathFunction[]
) {
  const { left, right, up, height, width, gridSize } = params;

  funcs.forEach((mathFunction) => {
    const { func, color } = mathFunction;

    ctx.strokeStyle = GRAPH_COLORS[color] ?? GRAPH_COLORS["orange"];
    ctx.fillStyle = GRAPH_COLORS[color] ?? GRAPH_COLORS["orange"];
    ctx.lineWidth = 4;
    let previous: number[] = [];
    for (let i = left; i <= right; i += 0.001) {
      const ogY = func(i);
      if (isNaN(ogY)) {
        previous = [];
        continue;
      }
      const y = 4 + gridSize[0] * (-ogY + up);
      const x = 4 + gridSize[1] * (i - left);
      if (!isNaN(y) && y >= 4 && y <= 4 + height && x >= 4 && x <= 4 + width) {
        if (
          previous.length === 2 &&
          Math.sqrt(
            ((x - previous[1]) * gridSize[1]) ** 2 +
              ((y - previous[0]) * gridSize[0]) ** 2
          ) <= Math.sqrt((1 * gridSize[1]) ** 2 + (1 * gridSize[0]) ** 2)
        ) {
          ctx.beginPath();
          ctx.moveTo(previous[1], previous[0]);
          ctx.lineTo(x, y);
          ctx.fill();
          ctx.stroke();
          ctx.fillRect(x - 1, y - 1, 2, 2);
        } else {
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
        ctx.fillRect(x - 1, y - 1, 2, 2);
        previous = [y, x];
      } else {
        previous = [];
      }
    }
  });
}

export function drawGraphPoints(
  ctx: CanvasRenderingContext2D,
  params: GraphParams,
  pts: MathPoint[]
) {
  const { left, up, color, gridSize } = params;

  pts.forEach((point) => {
    const { points, variant } = point;
    const [y, x] = points;

    ctx.beginPath();
    ctx.arc(
      (x + Math.abs(left)) * gridSize[1] + 4,
      (-y + Math.abs(up)) * gridSize[0] + 4,
      4,
      0,
      2 * Math.PI
    );

    ctx.strokeStyle = GRAPH_COLORS[color];
    ctx.fillStyle = variant === "solid" ? GRAPH_COLORS[color] : "white";
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
  });
}

export function drawGraphAsymptotes(
  ctx: CanvasRenderingContext2D,
  params: GraphParams,
  asyms: MathAsymptote[]
) {
  const { left, up, borderSize, gridSize, width, height } = params;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 10]);

  asyms.forEach((asym) => {
    const { type, value } = asym;
    if (type === "x") {
      ctx.beginPath();
      ctx.moveTo(borderSize + (value - left) * gridSize[1], borderSize);
      ctx.lineTo(
        borderSize + (value - left) * gridSize[1],
        borderSize + height
      );
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(borderSize, borderSize + (up - value) * gridSize[0]);
      ctx.lineTo(borderSize + width, borderSize + (up - value) * gridSize[0]);
      ctx.stroke();
    }
  });

  ctx.setLineDash([]);
}

interface SourceFunctionParamsMap {
  bounds: [number, number];
  colors: GraphColors;
}

type FunctionParams = keyof SourceFunctionParamsMap;

const FUNCTION_PARAMS = ["bounds", "colors"] as FunctionParams[];

export function parseSourceFunctionParam<T extends FunctionParams>({
  expected,
  source,
}: {
  expected: T;
  source: string;
}) {
  switch (expected) {
    case "bounds":
      try {
        const parsed = JSON.parse(source);

        if (
          Array.isArray(parsed) &&
          parsed.length === 2 &&
          expected === "bounds"
        ) {
          return parsed;
        }
      } catch (e) {
        return null;
      }
      break;
    case "colors":
      if (Object.keys(GRAPH_COLORS).includes(source)) {
        return source;
      }
      break;
  }

  return null;
}

export function parseSourceFunctions(
  source: string,
  globalBounds: [number, number]
) {
  const sources = source.replace("function:", "").split(";");

  return sources
    .map((f: string) => {
      const resultFunction: MathFunction = {
        color: "orange",
        func: () => 0,
      };

      let bounds: [number, number] = globalBounds;

      const parsed = f.split("@");

      if (parsed.length < 1 || parsed.length > 3) return null;

      const strFunc = parsed[0];

      parsed.slice(1).forEach((phrase) => {
        FUNCTION_PARAMS.some((type) => {
          const data = parseSourceFunctionParam({
            expected: type,
            source: phrase,
          });

          if (!data) return;

          switch (type) {
            case "bounds":
              bounds = data as [number, number];
              break;
            case "colors":
              resultFunction.color = data as GraphColors;
              break;
            default:
          }
        });
      });

      const [l, r] = bounds;

      const mathFunction = (x: number) => {
        if (x < l || x > r) return NaN;

        const value = evaluateMath(strFunc.replace(/x/g, `(${x})`));
        return value;
      };

      return {
        ...resultFunction,
        func: mathFunction,
      };
    })
    .filter((f) => f) as MathFunction[];
}

interface SourcePointParamsMap {
  colors: GraphColors;
  variant: "solid" | "outline";
}

type PointParams = keyof SourcePointParamsMap;

const POINT_PARAMS = ["colors", "variant"] as PointParams[];

export function parseSourcePointParam<T extends PointParams>({
  expected,
  source,
}: {
  expected: T;
  source: string;
}) {
  switch (expected) {
    case "variant":
      if (Object.values(POINT_VARIANTS as string[]).includes(source)) {
        return source;
      }
      break;
    case "colors":
      if (Object.keys(GRAPH_COLORS).includes(source)) {
        return source;
      }
      break;
  }

  return null;
}

export function parseSourcePoints(source: string) {
  const sources = source.replace("point:", "").split(";");

  return sources
    .map((point) => {
      const parsed = point.split("~");

      if (parsed.length < 1 || parsed.length > 3) return null;

      const coords = (() => {
        try {
          const parsedCoords = JSON.parse(`[${parsed[0]}]`);

          if (Array.isArray(parsedCoords) && parsedCoords.length === 2)
            return parsedCoords as [number, number];
        } catch (e) {
          return [NaN, NaN];
        }
      })() || [NaN, NaN];

      const resultPoint: MathPoint = {
        points: coords as [number, number],
        color: "orange",
        variant: "solid",
      };

      parsed.slice(1).forEach((phrase) => {
        POINT_PARAMS.some((type) => {
          const data = parseSourcePointParam({
            expected: type,
            source: phrase,
          });

          if (!data) return;

          switch (type) {
            case "variant":
              resultPoint.variant = data as PointVariants;
              return true;
            case "colors":
              resultPoint.color = data as GraphColors;
              return true;
            default:
              return false;
          }
        });
      });

      return resultPoint;
    })
    .filter((p) => p) as MathPoint[];
}

export function parseSourceAsymptotes(source: string) {
  return source.split(",").map((instance) => {
    return {
      type: instance.startsWith("y=") ? "y" : "x",
      value: Number(instance.slice(2)),
    };
  }) as MathAsymptote[];
}

import { GRAPH_COLORS, POINT_VARIANTS } from "@/src/consts";
import {
  GraphColors,
  MathFunction,
  MathPoint,
  PointVariants,
} from "@/src/type";
import { evaluateMath } from "../evaluateMath";

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
      } catch (e) {}
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
      let resultFunction: MathFunction = {
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

      let resultPoint: MathPoint = {
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

          console.log(data);

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

import { GRAPH_COLORS } from "@/src/consts";
import { GraphColors, MathFunction } from "@/src/type";
import { evaluateMath } from "../evaluateMath";

interface SourceFunctionParamsMap {
  bounds: [number, number];
  colors: GraphColors;
}

type FunctionParams = keyof SourceFunctionParamsMap;

const FUNCTION_PARAMS = ["bounds", "colors"] as FunctionParams[];

type ParsedFunctionParams<T extends FunctionParams> =
  SourceFunctionParamsMap[T];

export function parseSourceFunctionParam<T extends FunctionParams>({
  expected,
  source,
}: {
  expected: T;
  source: string;
}) {
  try {
    const parsed = JSON.parse(source);

    if (Array.isArray(parsed) && parsed.length === 2 && expected === "bounds") {
      return parsed as ParsedFunctionParams<T>;
    }
  } catch (e) {}

  if (Object.keys(GRAPH_COLORS).includes(source)) {
    return source as ParsedFunctionParams<T>;
  }

  return null;
}

export function parseSourceFunctions(
  sources: string[],
  globalBounds: [number, number]
) {
  const convertedFunctions = sources
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

  return convertedFunctions;
}

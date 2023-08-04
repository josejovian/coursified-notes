import JXG from "jsxgraph";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  createRef,
} from "react";
import { MathFunction, MathPoint } from "@/src/type";
import { evaluateMath } from "@/src/utils";
import { useSwapPage } from "@/src/hooks";

interface GraphProps {
  id: string;
  functions?: string;
  points?: string;
}

export default function Graph({ id, functions = "", points = "" }: GraphProps) {
  const [loading, setLoading] = useState(true);
  const [build, setBuild] = useState(false);
  const [success, setSuccess] = useState(false);
  const [funcs, setFuncs] = useState<MathFunction[]>([]);
  const [pts, setPts] = useState<MathPoint[]>([]);
  const stateSwapPages = useSwapPage();
  const [swapPages, setSwapPages] = stateSwapPages;

  console.log("Functions>>");
  console.log(functions);

  const parsedFunctions = useMemo(
    () => functions.replace("function:", "").split(","),
    [functions]
  );

  const parsedPoints = useMemo(
    () => points.replace("point:", "").split("/"),
    [points]
  );

  const handleInitializeFunctions = useCallback(() => {
    const convertedFunctions = parsedFunctions.map((f: string) => {
      return (x: number) => {
        const value = evaluateMath(f.replace(/x/g, `(${x})`));
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

    setPts(convertedPoints);
  }, [parsedPoints]);

  const handleInitializeGraph = useCallback(() => {
    if (!loading) return;

    if (!document.getElementById(id)) return;

    const board = JXG.JSXGraph.initBoard(id, {
      keepAspectRatio: true,
      offsetX: -99,
      offsetY: -99,
      boundingbox: [-5, 5, 5, -5],
      axis: true,
      showNavigation: false,
      showInfobox: true,
    });

    funcs.forEach((mathFunction) => {
      board.create("functiongraph", [mathFunction, -6, 6]);
    });

    pts.forEach((mathPoint) => {
      let params = {};

      switch (mathPoint.variant) {
        case "solid":
          params = { strokeColor: "blue", fillColor: "blue" };
          break;
        case "outline":
          params = { strokeColor: "blue", fillColor: "white" };
          break;
      }

      if (!isNaN(mathPoint.points[0]) && !isNaN(mathPoint.points[1]))
        board.create("point", mathPoint.points, params);
    });

    if (build) setLoading(false);
  }, [build, funcs, id, loading, pts]);

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

  return <div id={id} style={{ width: 480, height: 480 }}></div>;
}

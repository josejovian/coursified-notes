import { MathFunction, MathPoint } from "@/src/type/Math";
import JXG from "jsxgraph";
import { useEffect, useState, useCallback, useRef } from "react";

interface GraphProps {
	mathFunctions: MathFunction[];
	mathPoints: MathPoint[];
	id: string;
}

export default function Graph({ id, mathFunctions, mathPoints }: GraphProps) {
	const [loading, setLoading] = useState(true);

	const renderFunction = useCallback(() => {
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

		mathFunctions.forEach((mathFunction) => {
			board.create("functiongraph", [mathFunction, -6, 6]);
		});

		mathPoints.forEach((mathPoint) => {
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

		setLoading(false);
	}, [id, loading, mathFunctions, mathPoints]);

	useEffect(() => {
		renderFunction();
	}, [renderFunction]);

	return (
		<div id={id} className={id} style={{ width: 480, height: 480 }}></div>
	);
}

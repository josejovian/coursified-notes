import { GraphColors, GraphParams, MathFunction, MathPoint } from "@/src/type";

const graphColors: Record<GraphColors, string> = {
  red: "#e74c3c",
  blue: "#3498db",
  green: "#2ecc71",
  purple: "#9b59b6",
  orange: "#e67e22",
};

export function drawGraphAxes(
  ctx: CanvasRenderingContext2D,
  params: GraphParams
) {
  const { width, height, left, up, gridSize, borderSize } = params;

  ctx.beginPath();
  ctx.moveTo(borderSize, Math.abs(up) * gridSize + borderSize);
  ctx.lineTo(borderSize + width, Math.abs(up) * gridSize + borderSize);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(Math.abs(left) * gridSize + borderSize, borderSize);
  ctx.lineTo(Math.abs(left) * gridSize + borderSize, borderSize + height);
  ctx.stroke();
}

export function drawGraphAxesArrows(
  ctx: CanvasRenderingContext2D,
  params: GraphParams
) {
  const {
    up,
    right,
    down,
    left,
    height,
    width,
    arrowSize,
    borderSize,
    gridSize,
  } = params;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(borderSize, Math.abs(up) * gridSize + borderSize);
  ctx.lineTo(
    borderSize + arrowSize,
    Math.abs(up) * gridSize + borderSize + arrowSize
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(borderSize, Math.abs(up) * gridSize + borderSize);
  ctx.lineTo(
    borderSize + arrowSize,
    Math.abs(up) * gridSize + borderSize - arrowSize
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(borderSize + width, Math.abs(up) * gridSize + borderSize);
  ctx.lineTo(
    borderSize + width - arrowSize,
    Math.abs(up) * gridSize + borderSize - arrowSize
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(borderSize + width, Math.abs(up) * gridSize + borderSize);
  ctx.lineTo(
    borderSize + width - arrowSize,
    Math.abs(up) * gridSize + borderSize + arrowSize
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(borderSize + Math.abs(left) * gridSize, borderSize);
  ctx.lineTo(
    borderSize + Math.abs(left) * gridSize - arrowSize,
    borderSize + arrowSize
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(borderSize + Math.abs(left) * gridSize, borderSize);
  ctx.lineTo(
    borderSize + Math.abs(left) * gridSize + arrowSize,
    borderSize + arrowSize
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(borderSize + Math.abs(left) * gridSize, borderSize + height);
  ctx.lineTo(
    borderSize + Math.abs(left) * gridSize - arrowSize,
    borderSize + height - arrowSize
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(borderSize + Math.abs(left) * gridSize, borderSize + height);
  ctx.lineTo(
    borderSize + Math.abs(left) * gridSize + arrowSize,
    borderSize + height - arrowSize
  );
  ctx.stroke();
}

export function drawGraphAxesMarker(
  ctx: CanvasRenderingContext2D,
  params: GraphParams
) {
  const {
    up,
    borderSize,
    gridSize,
    width,
    height,
    left,
    vertical,
    horizontal,
  } = params;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  for (let i = 1; i < horizontal; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.abs(left) * gridSize - borderSize, borderSize + i * 32);
    ctx.lineTo(Math.abs(left) * gridSize + 3 * borderSize, borderSize + i * 32);
    ctx.stroke();
  }

  for (let i = 1; i < vertical; i++) {
    ctx.beginPath();
    ctx.moveTo(borderSize + i * 32, Math.abs(up) * gridSize - borderSize);
    ctx.lineTo(borderSize + i * 32, Math.abs(up) * gridSize + 3 * borderSize);
    ctx.stroke();
  }
}

export function drawGraphGrids(
  ctx: CanvasRenderingContext2D,
  params: GraphParams
) {
  const { vertical, height, horizontal, width, borderSize, gridSize } = params;

  ctx.strokeStyle = "lightgray";
  ctx.lineWidth = 2;
  for (let i = 0; i <= vertical; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize + borderSize, 0 + borderSize);
    ctx.lineTo(i * gridSize + borderSize, height + borderSize);
    ctx.stroke();
  }
  for (let i = 0; i <= horizontal; i++) {
    ctx.beginPath();
    ctx.moveTo(borderSize, i * gridSize + borderSize);
    ctx.lineTo(borderSize + width, i * gridSize + borderSize);
    ctx.stroke();
  }
}

export function drawGraphFunction(
  ctx: CanvasRenderingContext2D,
  params: GraphParams,
  funcs: MathFunction[]
) {
  const { left, right, up, height, width, color } = params;

  ctx.strokeStyle = graphColors[color];
  ctx.fillStyle = graphColors[color];
  ctx.lineWidth = 4;

  funcs.forEach((mathFunction) => {
    let previous: number[] = [];
    for (let i = left; i <= right; i += 0.001) {
      const x = 4 + 32 * (i - left);
      const y = 4 + 32 * (-mathFunction(i) + up);
      if (!isNaN(y) && y >= 4 && y <= 4 + height && x >= 4 && x <= 4 + width) {
        if (previous.length === 2) {
          ctx.beginPath();
          ctx.moveTo(previous[0], previous[1]);
          ctx.lineTo(x, y);
          ctx.fill();
          ctx.stroke();
          ctx.fillRect(x, y, 1, 1);
        } else {
          ctx.fillRect(x, y, 1, 1);
        }
        previous = [x, y];
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
  const { left, up, color } = params;

  pts.forEach((point) => {
    const { points, variant } = point;
    const [y, x] = points;

    ctx.beginPath();
    ctx.arc(
      (x + Math.abs(left)) * 32 + 4,
      (-y + Math.abs(up)) * 32 + 4,
      4,
      0,
      2 * Math.PI
    );

    ctx.strokeStyle = graphColors[color];
    ctx.fillStyle = variant === "solid" ? graphColors[color] : "white";
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
  });
}

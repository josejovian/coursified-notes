/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
const VALID_OPERATORS = [
  "+",
  "-",
  "*",
  "/",
  "(",
  ")",
  "[",
  "]",
  "^",
  ".",
  "\\",
] as const;

const VALID_FUNCTIONS = [
  "sin",
  "cos",
  "tan",
  "csc",
  "sec",
  "cot",
  "sqrt",
  "ln",
] as const;

type OperatorType = (typeof VALID_OPERATORS | typeof VALID_FUNCTIONS)[number];

function isNumber(character: string) {
  return !isNaN(Number(character));
}

function isOperator(character: any) {
  return (
    VALID_OPERATORS.includes(character) || VALID_FUNCTIONS.includes(character)
  );
}

function getPriority(operator: OperatorType) {
  if (operator === "+" || operator === "-") return 0;
  if (operator === "*" || operator === "/" || operator === "^") return 1;
  if (VALID_FUNCTIONS.includes(operator as any) || operator === "\\") return 1;
  return -1;
}

function applyMath(
  operand1: number,
  operand2: number,
  operator: OperatorType
): number {
  switch (operator) {
    case "+":
      ////console.log(`${operand1} + ${operand2}`);
      return operand1 + operand2;
    case "-":
      //console.log(`${operand1} - ${operand2}`);
      return operand1 - operand2;
    case "*":
      return operand1 * operand2;
    case "/":
      return operand2 !== 0 ? operand1 / operand2 : NaN;
    case "^":
      if (operand1 !== 0 && operand2 !== 0) return Math.pow(operand1, operand2);

      if (operand1 !== 0) return 1;

      return NaN;
    case "sin":
      return Math.sin(operand2);
    case "cos":
      return Math.cos(operand2);
    case "tan":
      return Math.tan(operand2);
    case "csc":
      const sin = Math.sin(operand2);
      return sin !== 0 ? 1 / sin : NaN;
    case "sec":
      const cos = Math.cos(operand2);
      return cos !== 0 ? 1 / cos : NaN;
    case "cot":
      const tan = Math.tan(operand2);
      return tan !== 0 ? 1 / tan : NaN;
    case "sqrt":
      return Math.sqrt(operand2);
    case "ln":
      return Math.log(operand2);
  }
  return 0;
}

export function evaluateMath(expression: string) {
  const operands: number[] = [];
  const operators: OperatorType[] = [];

  function performOneOperation(operator: OperatorType) {
    const operand2 = operands.pop();
    const operand1 = operands.pop();
    operands.push(applyMath(operand1 ?? 0, operand2 ?? 0, operator));
  }

  for (let i = 0; i < expression.length; i++) {
    const character = expression[i];

    if (isNumber(character)) {
      let finalNumber = Number(character);
      let count = 0;
      let isComma = false;
      for (let j = i + 1; j < expression.length; j++) {
        if (expression[j] === "." && !isComma) isComma = true;
        else if (isNumber(expression[j])) {
          finalNumber *= 10;
          finalNumber += Number(expression[j]);
          if (isComma) count++;
          i = j;
        } else {
          i = j - 1;
          break;
        }
      }

      finalNumber /= Math.pow(10, count);
      //console.log(`Absorb: ${finalNumber}`);
      operands.push(finalNumber);
    } else if (character === ")" || character === "]") {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const head = operators.pop();

        if ((character === ")" && head === "(") || !head) break;

        if (character === "]" && head === "[") {
          let number = operands.pop() ?? 0;
          if (number < 0) number = -number;
          operands.push(number);
          break;
        }

        performOneOperation(head);
      }
    } else if (character === "(" || character === "[") {
      operators.push(character as OperatorType);
    } else if (
      isOperator(character) &&
      getPriority(character as OperatorType) > -1
    ) {
      if (
        character === "-" &&
        ((operators.length === 0 && i === 0) ||
          expression[i - 1] === "(" ||
          expression[i - 1] === "[")
      ) {
        //console.log("GET ZERO");
        operands.push(0);
      }

      let customFunction;

      if (character === "\\") {
        for (let j = 1; j < expression.length - i; j++) {
          if (isNumber(expression[i + j])) {
            i += j;
            break;
          }

          // 1+\sin2
          const detectedFunction = expression.slice(i + 1, i + j + 1) as any;

          if (VALID_FUNCTIONS.includes(detectedFunction)) {
            i += j;
            operands.push(0);
            customFunction = detectedFunction;
            break;
          }
        }
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const head = operators.pop();

        if (!head) break;

        const toBeTested = (customFunction ??
          character) as unknown as OperatorType;

        if (getPriority(head) < getPriority(toBeTested)) {
          operators.push(head);
          break;
        }

        performOneOperation(head);
      }

      customFunction
        ? operators.push(customFunction)
        : operators.push(character as OperatorType);
    }
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const head = operators.pop();

    if (!head) break;
    performOneOperation(head);
  }

  return operands[0];
}

const VALID_OPERATORS = ["+", "-", "*", "/", "(", ")", "[", "]", "."] as const;

type OperatorType = typeof VALID_OPERATORS[number];

function isNumber(character: string) {
	return !isNaN(Number(character));
}

function isOperator(character: any) {
	return VALID_OPERATORS.includes(character);
}

function getPriority(operator: OperatorType) {
	if (operator === "+" || operator === "-") return 0;
	if (operator === "*" || operator === "/") return 1;
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
			return operand2 !== 0 ? operand1 / operand2 : operand1;
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
		//console.log(`Index: ${i + 1}`);
		//console.log(operands.join("_"));
		//console.log(operators.join("_"));

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

			while (true) {
				const head = operators.pop();

				if (!head) break;

				if (
					getPriority(head) < getPriority(character as OperatorType)
				) {
					operators.push(head);
					break;
				}

				performOneOperation(head);
			}

			operators.push(character as OperatorType);
		}
	}

	while (true) {
		const head = operators.pop();

		if (!head) break;
		performOneOperation(head);
	}

	return operands[0];
}

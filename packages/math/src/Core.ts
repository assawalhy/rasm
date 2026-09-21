
export function isNumeric(value: unknown): value is string | number {
  return (typeof value === "string" || typeof value === "number") && !isNaN(value as number);
}

export function isInteger(value: unknown): value is string | number {
  return isNumeric(value) && Number(value) % 1 === 0;
}

export interface FractionResult {
  numerator: number;
  denominator: number;
}

export function fraction(num: number): FractionResult {
  if (num.toString().indexOf('.') > -1) {
    const num1 = Number.parseInt(num.toString().replace('.', ''));
    const num2 = 10 ** num.toString().split('.')[1].length;
    const gcd_ = gcd(num1, num2);
    return { numerator: num1 / gcd_, denominator: num2 / gcd_ };
  }

  return { numerator: num, denominator: 1 };
}

export interface QuotientRemainderResult {
  quotient: number;
  numerator: number;
  denominator: number;
}

export function quotientRemainder(num: number): QuotientRemainderResult {
  if (num.toString().indexOf('.') > -1) {
    const num1 = Number.parseInt(num.toString().split('.')[1]);
    const num2 = 10 ** num1.toString().length;

    const quotient = Number.parseInt(num.toString().split('.')[0]);
    const gcd_ = __gcd(num1, num2);

    return { quotient: quotient, numerator: num1 / gcd_, denominator: num2 / gcd_ };
  }

  return { quotient: num, numerator: 0, denominator: 1 };
}

export function newtonMethod(intialGuess: number, f: (x: number) => number, derivative: (x: number) => number): number {
  let x = intialGuess;
  let x_: number;
  do {
    x_ = x;
    // @ts-ignore
    cs.vars[0].value = { calculate: () => x_ }; // Dummy placeholder
    x = x_ - (f(x) / derivative(x));
    if (Math.abs(x_) < Math.abs(x)) {
      return Number.NaN;
    }
  } while (Math.abs(f(x)) > 1e-15);
  return x;
}


export function sqrt(x: number): number {
  return Math.sqrt(x);
}

export function mod(num1: number, num2: number): number {
  return num1 - num2 * Math.floor(num1 / num2);
}

export function max(...params: number[]): number {
  let max = params[0];
  for (const param of params) {
    max = Math.max(param, max);
  }
  return max;
}

export function min(...params: number[]): number {
  let min = params[0];
  for (const param of params) {
    min = Math.min(param, min);
  }
  return min;
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((y1 - y2) ** 2 + (x1 - x2) ** 2);
}

export function distVectors(v1: { x: number; y: number }, v2: { x: number; y: number }): number {
  return dist(v1.x, v1.y, v2.x, v2.y);
}

export function constrain(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function random(start: number, end: number): number {
  return start + Math.random() * (end - start);
}

export function randomInt(start: number, end: number): number {
  return Math.round(random(start, end));
}

export function gcd(...values: number[]): number {
  let gcd_ = Math.abs(values[0]);
  if (gcd_ % 1 !== 0) return Number.NaN;

  for (let i = 1; i < values.length; i++) {
    const a = Math.abs(values[i]);
    if (a % 1 !== 0) return Number.NaN;
    gcd_ = a > gcd_ ? __gcd(a, gcd_) : __gcd(gcd_, a);
  }

  return gcd_;
}

export function __gcd(a: number, b: number): number {
  if (b === 0) return a;
  return __gcd(b, a % b);
}

export function lcm(...values: number[]): number {
  let lcm_ = Math.abs(values[0]);
  if (lcm_ % 1 !== 0) return Number.NaN;

  for (let i = 1; i < values.length; i++) {
    const a = Math.abs(values[i]);
    if (a % 1 !== 0) return Number.NaN;
    lcm_ = __lcm(a, lcm_);
  }

  return lcm_;
}

export function __lcm(a: number, b: number): number {
  return a / __gcd(a, b) * b;
}


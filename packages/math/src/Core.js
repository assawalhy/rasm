
// #region checking, bool, is_

export function isNumeric(value) {
  return !isNaN(value);
  // return value.toString().replace(/^\s*(\-?\d+|\-?\d+\.\d*|\-?\d*\.\d+)\s*$/, '123') === '123';
}

export function isInteger(value) {
  return value % 1 === 0;
  // return value.toString().replace(/^\s*(\-?\d+|\-?\d+\.\d*|\-?\d*\.\d+)\s*$/, '123') === '123';
}

export function isPrime(number) {
  // determines if number is prime
  let divisor = Math.floor(number / 2);
  let prime = true;
  if (number % 1 === 0) {
    while (divisor > 1) {
      if (number % divisor === 0) {
        prime = false;
        divisor = 0;
      } else {
        divisor -= 1;
      }
    }
  } else {
    prime = false;
  }
  return prime;
}

// #endregion

// #region SimplifiedFraction

export function fraction(num) {
  if (num.toString().indexOf('.') > -1) {
    const num1 = Number.parseInt(num.toString().replace('.', ''));
    const num2 = 10 ** num.toString().split('.')[1].length;
    const gcd_ = gcd(num1, num2);
    return { numerator: num1 / gcd_, denominator: num2 / gcd_ };
  }

  return { numerator: num, denominator: 1 };
}

export function quotientRemainder(num) {
  if (num.toString().indexOf('.') > -1) {
    const num1 = Number.parseInt(num.toString().split('.')[1]);
    const num2 = 10 ** num1.toString().length;

    num = Number.parseInt(num.toString().split('.')[0]);
    const gcd_ = gcd2(num1, num2);

    return { quotient: num, numerator: num1 / gcd_, denominator: num2 / gcd_ };
  }

  return { quotient: num, numerator: 0, denominator: 1 };
}

// #endregion

// #region Finding Roots

export function newtonMethod(intialGuess, F, F_prime, cs) {
  let x = intialGuess;
  let x_;
  do {
    x_ = x;
    cs.vars[0].value = new Constant(x_);
    x = x_ - F.calculate(cs) / F_prime.calculate(cs);
    if (Math.abs(x_) < Math.abs(x)) {
      return Number.NaN;
    }
  } while (Math.abs(F.calculate(cs)) > 10 ** -15);
  return x;
}

// #endregion

//#region Methods

export function sqrt(x) {
  return Math.sqrt(x);
}

export function mod(num1, num2) {
  return num1 - num2 * Math.floor(num1 / num2);
}

export function max(...params) {
  let max = params[0];
  for (const param of params) {
    max = Math.max(param, max);
  }
  return max;
}

export function min(...params) {
  let min = params[0];
  for (const param of params) {
    min = Math.min(param, min);
  }
  return min;
}

export function dist(x1, y1, x2, y2) {
  return Math.sqrt((y1 - y2) ** 2 + (x1 - x2) ** 2);
}

export function distVectors(v1, v2) {
  return dist(v1.x, v1.y, v2.x, v2.y);
}

export function constrain(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function snap(value, options = { snapTo: { type: 'num', value: '' }, a: {} }) { }

export function random(start, end) {
  if (end) {
    return start + Math.random() * (end - start);
  }
  return Math.random() * start;
}

export function randomInt(start, end) {
  return Math.round(random(start, end));
}

export function gcd(...values) {
  let gcd_ = values[0];
  let a = values[1];
  if (gcd_ % 1 !== 0 || a % 1 !== 0) return Number.NaN;
  gcd_ = a > gcd_ ? gcd2(a, gcd_) : gcd2(gcd_, a);

  for (let i = 2; i < values.length; i++) {
    a = Math.abs(values[i]);
    if (a % 1 !== 0) return Number.NaN;
    gcd_ = a > gcd_ ? gcd2(a, gcd_) : gcd2(gcd_, a);
  }

  return gcd_;
}

export function gcd2(a, b) {
  if (b === 0) return a;
  return gcd2(b, a % b);
}

export function lcm(...values) {
  let product = 1;
  let a;
  for (let i = 0; i < values.length; i++) {
    a = values[i];
    if (a % 1 !== 0) return Number.NaN;
    product *= a;
  }
  return Math.abs(product) / gcd(...values) ** (values.length - 1);
}

//#endregion

export function calculateString(txt) {
  const node = stringTOnode(txt);
  return node.caluclate(CalculationSettings(), new Map());
}


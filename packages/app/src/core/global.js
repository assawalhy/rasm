import { parser } from '@rasm/math';

import { UndefError } from './Errors/index.js';
export function generateName() {
  return (Date.now() + generateName.randomNameNum++).toString(36);
}
generateName.randomNameNum = 0;

const mathFunc = {
  log: (x, base = 10) => Math.log10(x) / Math.log10(base),
  ln: (x) => Math.log(x, Math.E),

  sec: (x) => 1 / Math.cos(x),
  csc: (x) => 1 / Math.sin(x),
  cot: (x) => 1 / Math.tan(x),
  asec: (x) => Math.acos(1 / x),
  acsc: (x) => Math.asin(1 / x),
  acot: (x) => Math.atan(1 / x),

  sinh: (x) => (Math.exp(x) - Math.exp(-x)) / 2,
  cosh: (x) => (Math.exp(x) + Math.exp(-x)) / 2,
  tanh: (x) => Math.sinh(x) / Math.cosh(-x),
  asinh: (x) => Math.ln(x + Math.sqrt(x ** 2 + 1)),
  acosh: (x) => Math.ln(x + Math.sqrt(x ** 2 - 1)),
  atanh: (x) => 0.5 * Math.ln((1 + x) / (1 - x)),

  sech: (x) => 1 / Math.cosh(x),
  csch: (x) => 1 / Math.sinh(x),
  coth: (x) => 1 / Math.tanh(x),
  asech: (x) => Math.acosh(1 / x),
  acsch: (x) => Math.asinh(1 / x),
  acoth: (x) => Math.atanh(1 / x),

  fact: (x) => (x % 1 !== 0 || x < 0 ? Number.NaN : Math.__fact(x)),
  __fact: (x) => (x === 0 ? 1 : x * Math.__fact(x - 1)),

  gcd: (...values) => {
    let gcd_ = Math.abs(values[0]);
    let a = Math.abs(values[1]);
    if (gcd_ % 1 !== 0 || a % 1 !== 0) return Number.NaN;
    gcd_ = a > gcd_ ? Math.__gcd(a, gcd_) : Math.__gcd(gcd_, a);

    for (let i = 2; i < values.length; i++) {
      a = Math.abs(values[i]);
      if (a % 1 !== 0) return Number.NaN;
      gcd_ = a > gcd_ ? Math.__gcd(a, gcd_) : Math.__gcd(gcd_, a);
    }

    return gcd_;
  },
  __gcd(a, b) {
    if (b === 0) return a;
    return Math.__gcd(b, a % b);
  },
  lcm: (...values) => {
    let product = 1;
    let a;
    for (let i = 0; i < values.length; i++) {
      a = values[i];
      if (a % 1 !== 0) return Number.NaN;
      product *= a;
    }
    return Math.abs(product) / Math.gcd(...values) ** (values.length - 1);
  },

  mod: (a, b) => {
    return a % b;
  },
};

Object.assign(Math, mathFunc);

const vars = {
  pi: Math.PI,
  e: Math.E,
};

Object.assign(Math, vars);

export function getJSfunction(input, params, usestrict = true, undefThrowError = true) {
  let result;
  if (input instanceof parser.latexParser.Node) {
    result = parser.parsedTOjsFunction(input, params, 'Math', usestrict);
  } else if ((typeof input).toLowerCase() === 'object') {
    result = parser.latexTOjsfunction(input.value, params, usestrict);
  } else {
    result = parser.latexTOjsfunction(input, params, usestrict);
  }
  if (undefThrowError) {
    if (result.undef.vars.length > 0 || result.undef.funcs.length > 0) throw new UndefError(result.undef);
    return result.func;
  }
  return result.func;
}

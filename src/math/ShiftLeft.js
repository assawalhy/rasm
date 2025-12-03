import Binary from './Binary.js';

class ShiftLeft extends Binary {
  calculate(cs, tempVars) {
    const a = this.children[0].calculate(cs, tempVars);
    const b = this.children[1].calculate(cs, tempVars);
    if (b % 1 !== 0) return Number.NaN;

    return a << b;
  }

  toString() {
    return null;
  }
}

export default ShiftLeft;

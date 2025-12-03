import Binary from './Binary.js';

class Bnot extends Binary {
  constructor(children) {
    super(children, 2);
  }

  calculate(cs, tempVars) {
    const a = this.children[0].calculate(cs, tempVars);
    if (a % 1 !== 0) return Number.NaN;
    return ~a;
  }

  toString() {
    return null;
  }
}

export default Bnot;

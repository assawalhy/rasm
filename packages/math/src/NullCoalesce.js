import Binary from './Binary.js';

class NullCoalesce extends Binary {
  calculate(cs, tempVars) {
    const a2 = this.children[0].calculate(cs, tempVars);
    return isNaN(a2) || !Number.isFinite(a2) ? this.children[1].calculate(cs, tempVars) : a2;
  }
  toString() {
    return null;
  }
}

export default NullCoalesce;

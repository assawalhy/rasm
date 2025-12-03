import Binary from './Binary.js';

class Bor extends Binary {
  calculate(cs, tempVars) {
    return this.children[0].calculate(cs, tempVars) | this.children[1].calculate(cs, tempVars);
  }
  toString() {
    return null;
  }
}

export default Bor;

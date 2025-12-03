import Bool from './Bool.js';

class GreaterEquals extends Bool {
  constructor(children) {
    super(children, 2);
    this.syntaxType = 'operator';
  }

  calculate(cs, tempVars) {
    const num1 = this.children[0].calculate(cs, tempVars);
    const num2 = this.children[1].calculate(cs, tempVars);
    if (!Number.isFinite(num1) || Number.isNaN(num1) || !Number.isFinite(num2) || Number.isNaN(num2)) {
      return Number.NaN;
    }
    if (num1 >= num2) return 1;
    return 0;
  }

  simplify() {
    const sChild1 = this.children[0].simplify();
    const sChild2 = this.children[1].simplify();
    return new GreaterEquals(sChild1, sChild2);
  }

  isEqual(node) {
    if (this.constructor === node.constructor) {
      const sChild1 = this.children[0].simplify();
      const sChild2 = this.children[1].simplify();
      const sChild1_ = this.children[0].simplify();
      const sChild2_ = this.children[1].simplify();
      if (sChild1.isEqual(sChild1_) && sChild2.isEqual(sChild2_)) {
        return true;
      }
    } else if (node.type === 'LowerEquals') {
      const sChild1 = this.children[0].simplify();
      const sChild2 = this.children[1].simplify();
      const sChild1_ = this.children[0].simplify();
      const sChild2_ = this.children[1].simplify();
      if (sChild2.isEqual(sChild1_) && sChild1.isEqual(sChild2_)) {
        return true;
      }
    }
    return false;
  }

  toString() {
    let child1 = '';
    let child2 = '';

    if (this.children[0].syntaxType === 'literal' || this.children[0].syntaxType === 'function')
      child1 = this.children[0].toString();
    else child1 = `(${this.children[0].toString()})`;

    if (this.children[1].syntaxType === 'literal' || this.children[1].syntaxType === 'function')
      child2 = this.children[1].toString();
    else child2 = `(${this.children[1].toString()})`;

    return `${child1} >= ${child2}`;
  }
}

export default GreaterEquals;

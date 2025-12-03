import Bool from './Bool.js';

class Not extends Bool {
  constructor(children) {
    super(children, 1);
    this.syntaxType = 'literal';
  }

  calculate(cs, tempVars) {
    const num = this.children[0].calculate(cs, tempVars);
    if (isNaN(num)) {
      return Number.NaN;
    }
    if (num === 0) return 1;
    return 0;
  }

  simplify() {
    const sChild1 = children[0].simplify();
    if (sChild1 instanceof Not) return sChild1.children[0];

    if (sChild1 instanceof And) return new Nand(sChild1.children[0], sChild1.children[1]);
    if (sChild1 instanceof Or) return new Nor(sChild1.children[0], sChild1.children[1]);

    if (sChild1 instanceof Nand) return new And(sChild1.children[0], sChild1.children[1]);
    if (sChild1 instanceof Nor) return new Or(sChild1.children[0], sChild1.children[1]);

    if (sChild1 instanceof NotEqual) return new Equals(sChild1.children[0], sChild1.children[1]);
    if (sChild1 instanceof Equals) return new NotEqual(sChild1.children[0], sChild1.children[1]);

    return new Not(sChild1);
  }

  isEqual(node) {
    if (this.constructor === node.constructor) {
      const sChild1 = children[0].simplify();
      const sChild1_ = node.children[0].simplify();
      if (sChild1.isEqual(sChild1_)) {
        return true;
      }
    }
    return false;
  }

  toString() {
    let child = '';
    if (this.children[0].syntaxType === 'literal' || this.children[0].syntaxType === 'function')
      child = this.children[0].toString();
    else child = `(${this.children[0].toString()})`;
    return `!${child}`;
  }
}

export default Not;

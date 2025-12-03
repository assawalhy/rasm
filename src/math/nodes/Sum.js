import Node from '../Node.js';

class Sum extends Node {
  /**
   *
   * @param {let} param
   * @param {Array<Node>} this.children
   */
  constructor(param, children) {
    super(children, 4);
    this.syntaxType = 'function';

    this.param = param;
    this.children = this.children;
  }
  calculate(cs, tempVars = []) {
    let sum = 0;
    const start = this.children[0].calculate(cs, tempVars);
    const end = this.children[1].calculate(cs, tempVars);
    const step = this.children[2].calculate(cs, tempVars);
    let valueToAdd;
    sum = start;
    //#region Preparing tempVars

    const tempvars = [...tempVars, { key: this.param, value: null }];

    //#endregion

    for (let i = 1; i <= Math.round((end - start) / step); i++) {
      tempvars[tempvars.length - 1].value = new Constant(start + i * step);
      valueToAdd = this.children[3].calculate(cs, tempvars);
      if (Number.isNaN(valueToAdd)) return Number.NaN;
      sum += valueToAdd;
    }

    return sum;
  }

  derivative(cs) {
    return new Sum(this.param, [this.children[0], this.children[1], this.children[2], this.children[3].derivative(cs)]);
  }

  simplify() {
    const children = [];
    for (let i = 0; i < this.children.length; i++) {
      this.children.push(this.children[i].simplify());
    }
    return new Sum(this.param, children);
  }

  isEqual(node) {
    if (node instanceof Sum) {
      for (let i = 0; i < this.children.length; i++) {
        if (!this.children[i].simplify().isEqual(node.children[i].simplify())) return false;
      }
      return true;
    }
    return false;
  }

  toString() {
    if (this.children[2].toString() === '1')
      return `${this.type.toLowerCase()}(${this.param.toString()}, ${this.children[0].toString()}, ${this.children[1].toString()}, ${this.children[3].toString()})`;

    return `${this.type.toLowerCase()}(${this.param.toString()}, ${this.children[0].toString()}, ${this.children[1].toString()}, ${this.children[2].toString()}, ${this.children[3].toString()})`;
  }
}

export default Sum;

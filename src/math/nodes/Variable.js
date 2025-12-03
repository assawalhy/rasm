import Node from '../Node.js';

class Variable extends Node {
  constructor(name) {
    super([], 0);
    this.name = name;
    this.syntaxType = 'literal';
  }

  calculate(cs, tempVars) {
    /// Searching for temporary variables, like the variables that passed from a segma notation or passed into a function.
    for (let i = 0; i < tempVars.length; i++) {
      if (tempVars[i].key === this.name) return tempVars[i].value.calculate(cs, tempVars);
    }
    for (let i = 0; i < cs.vars.length; i++) {
      if (cs.vars[i].name === this.name) return cs.vars[i].value.calculate(cs);
    }
    throw new Error(`\"${this.name}\" doesn't exist. :(`);
  }

  derivative(cs) {
    if (cs.derivatingVariable === this.name) return new Constant(1);

    for (let i = 0; i < cs.vars.length; i++) {
      if (cs.vars[i].name === this.name) {
        return cs.vars[i].value.derivative(cs);
      }
    }

    return new Constant(0);
  }

  toString() {
    return this.name;
  }

  simplify() {
    return this;
  }

  isEqual(node) {
    if (this.constructor === node.constructor) {
      if (this.name === node.name) {
        return true;
      }
    }
    return false;
  }
}

export default Variable;

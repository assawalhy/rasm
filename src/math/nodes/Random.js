import Node from '../Node.js';

class Random extends Node {
  /**
   * @param {*} children
   * @param {string} type 'double' or 'int'
   */
  constructor(children, type = 'double') {
    super(children, -1);
    this.syntaxType = 'function';
    this.myType = type;
    if (this.children.length === 1 && this.children[0] instanceof Set) {
      this.myType = 'Set';
    }
    if (this.children.length > 2) {
      this.myType = 'set';
    }
    this.limits = children.length;
  }

  calculate(cs, tempVars) {
    switch (this.myType) {
      case 'double':
        if (this.children) {
          if (this.limits === 1) {
            const child1 = this.children[0].calculate(cs, tempVars);
            return child1 > 0 ? random(0, child1) : random(child1, 0);
          }
          if (this.limits === 2) {
            const child1 = this.children[0].calculate(cs, tempVars);
            const child2 = this.children[0].calculate(cs, tempVars);
            return random(child1, child2);
          }
        }
        return random();
      case 'int':
        if (this.children) {
          if (this.limits === 1) {
            const child1 = this.children[0].calculate(cs, tempVars);
            return child1 > 0 ? Math.round(random(0, child1)) : Math.round(random(child1, 0));
          }
          if (this.limits === 2) {
            const child1 = this.children[0].calculate(cs, tempVars);
            const child2 = this.children[0].calculate(cs, tempVars);
            return Math.round(random(child1, child2));
          }
        }
        return Math.round(random() * 10);
      case 'set': {
        const index = Math.round(random(0, this.children[0].length));
        return this.children[index].calculate(cs, tempVars);
      }
      case 'Set': {
        const index = Math.round(random(0, this.children[0].length));
        return this.children[0].items[index].calculate(cs, tempVars);
      }
    }
  }

  derivative(cs) {
    return new Constant(Number.NaN);
  }

  simplify() {
    switch (this.children.length) {
      case 0:
        return new Random(this.myType);
      case 1:
        return new Random([this.children[0].simplify()], this.myType);
      //case 2:
      default:
        return new Random([this.children[0].simplify(), this.children[1].simplify()], this.myType);
    }
  }

  isEqual(node) {
    if (this.constructor === node.constructor && this.myType === node.myType) {
      for (let i = 0; i < this.children.length; i++) {
        if (!this.children[i].simplify().isEqual(node.children[i].simplify())) return false;
      }
      return true;
    }
    return false;
  }

  toString() {
    if (this.children.length === 0) {
      const type = myType === 'double' ? '' : myType.toString();
      return `random(${type})`;
    }
    if (this.children.length === 1) {
      const type = myType === 'double' ? '' : `, ${myType.toString()}`;
      return `random(${children[0]}${type})`;
    }

    const type = myType === 'double' ? '' : `, ${myType.toString()}`;
    return `${this.type.toLowerCase()}(${this.children[0].toString()}, ${this.children[1].toString()}${this.myType})`;
  }
}

export default Random;

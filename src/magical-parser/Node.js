/**
 * sNode stands for structural node, used to represent the structure of the input text.
 * You can use the result (which is tree node of sNode with particular properties) to do incredible things.
 * It is used as a parser in mathpackage: {https://github.com/MuhammadSawalhy/rakam}
 */
class Node {
  /**
   * @param {string} type - One of these: 'id', 'func', 'num', 'bool_op', 'binary_op', 'bool', op = {'+', '-', '*', '/', '^', '=', ...}
   * @param {Array} args - Array of sNode
   * @param {Object} attributes - Object contains attribute names and values
   */
  constructor(type, args = [], attributes = {}) {
    Object.assign(this, attributes);
    this.args = Array.isArray(args) ? args : [args];
    this.type = type;
  }

  check(props, argsCount = this.args.length) {
    for (const prop in props) {
      if (this[prop] !== props[prop]) return false;
    }
    return true;
  }

  contains(check) {
    if (this.check(check)) {
      return true;
    }

    if (this.args) {
      for (let i = 0; i < this.args.length; i++) {
        if (this.args[i].contains(check)) return true;
      }
    }
    return false;
  }

  get isLiteral() {
    return this.type === 'literal';
  }
}

export default Node;

import Node from '../Node.js';
import Rule from './Rule.js';

class Sequence extends Rule {
  constructor(childrenRules, properties) {
    properties = Object.assign(
      {
        spaced: true,
      },
      properties,
    );

    if (childrenRules.length === 0) {
      throw new Error("Sequence mustn't be void.");
    }

    super('Sequence', -1, childrenRules, properties);
  }

  getRegex() {
    let regex = '';
    const spaced = this.spaced ? '\\s*' : '';

    for (const rule of this.childrenRules) {
      regex += `(${rule.getRegex()})${spaced}`;
    }

    return regex;
  }

  parse(groups, useValue) {
    const args = [];

    for (let i = 0; i < this.childrenNum; i++) {
      args.push(this.childrenRules[i].parse(groups));
    }

    return new Node(this.name, args, { match: groups[0] });
  }
}

export default Sequence;

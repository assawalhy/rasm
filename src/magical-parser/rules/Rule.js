import Block from './Block.js';

class Rule {
  constructor(ruleDefaultName, childrenNum, childrenRules, properties = {}) {
    properties.name = properties.name || ruleDefaultName;

    Object.assign(this, Object.assign(properties, this));

    this.childrenNum = childrenNum;
    if (childrenRules.length !== childrenNum && childrenNum > -1) {
      throw Error(`rules num in ${this.name || ''} must be ${this.rulesNum}`);
    }

    for (const rule of childrenRules) {
      rule.parentRule = this;
    }

    this.childrenRules = childrenRules;
  }

  getRegex() {
    throw new Error('You must override getRegex() in subclass');
  }

  parse(groups, useValue) {
    /**
     * "useValue" is here to be used in the Repeat rule while parsing
     */
    throw new Error("You mustn't call this function directly from the abstract class Rule.");
  }

  getBlocksInside() {
    if (this instanceof Block) {
      return [this];
    }

    let blocks = [];
    for (const child of this.children) {
      blocks = blocks.concat(child.getBlocksInside());
    }

    return blocks;
  }
}

export default Rule;

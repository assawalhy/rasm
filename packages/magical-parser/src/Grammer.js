import Block from './rules/Block.js';

class Grammer {
  constructor(rule) {
    this.rule = rule;
  }

  prepareBlocks() {
    this.blocks = this.rule.getBlocksInside();
  }

  prepareRegexes() {
    this.regex = this.rule.getRegex();
  }

  get rule() {
    return this._rule;
  }

  set rule(value) {
    this._rule = value;
    this.prepareBlocks();
    this.prepareRegexes();
  }
}

export default Grammer;

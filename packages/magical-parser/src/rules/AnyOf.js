import Node from '../Node.js';
import Rule from './Rule.js';

export default class AnyOf extends Rule {
  constructor(childrenRules, properties) {
    if (childrenRules.length === 0) throw new Error('Sequence musn\t be void.');
    super('AnyOf', -1, childrenRules, properties);
  }

  getRegex(groubIndex) {
    this.index = groubIndex.num;

    //#region getting regex
    let regex = '';
    this.childrenRules.forEach((child) => {
      regex += `${child.getRegex(groubIndex.increase())}|`;
    });
    //#endregion

    return `(${regex})`;
  }

  parse(groups, useValue) {
    let value = useValue || groups[this.index + 1];
    const args = [];

    if (this.blockState) {
      value = value.replace(this.rootParser.matchesTest, (match, id, index) => {
        return this.rootParser.matches[id][index].str;
      });
    }

    //#region getting args
    for (const child of this.childrenRules) {
      if (groups.values[child.index]) {
        // this is the child being found
        args.push(child.parse(groups));
        break;
      }
    }
    //#endregion

    return new Node(this.name, args, {
      match: value,
    });
  }
}

import Node from '../Node.js';
import Rule from './Rule.js';

export default class AnyThing extends Rule {
  constructor(properties) {
    super('Anything', 0, [], properties);
  }

  getRegex(groubIndex = 0) {
    groubIndex = groubIndex || {
      num: 0,
      increase: function (step = 1) {
        this.num += step;
        return this;
      },
    };
    this.index = groubIndex.num;
    return '(.*?)';
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
    if (this.parser) {
      args.push(this.parser.parse(value));
    }
    //#endregion

    return new Node(this.name, args, { match: value });
  }
}

import Node from '../Node.js';
import Parser from '../Parser.js';
import { getGroupsNumInReg, getRandomName, operationBlockChar, regSpecialChars } from '../global.js';
import Rule from './Rule.js';

export default class Block extends Rule {
  /**
   *
   * @param {Object} properties
   * you should set
   * opening as regex or string, closing as RegExp or string,
   * [optional] content: Rule or regex or string,
   * [optional] parser: to be used for parsing the content
   */
  constructor(properties) {
    properties.opening =
      properties.opening instanceof RegExp ? properties.opening.source : regSpecialChars(properties.opening);
    properties.closing =
      properties.closing instanceof RegExp ? properties.closing.source : regSpecialChars(properties.closing);

    if (properties.opening && properties.closing) {
      if (properties.opening !== properties.closing) {
        /** this Block can't be represented by regex */
        properties.blockState = true;
      }
      properties.content = properties.content || 'all';
      properties.groupsNumInside = 0; /// if the content is regex, we should take care of the groups inside
      if (!(properties.content instanceof Rule)) {
        if (properties.content instanceof RegExp) {
          // converting regex into string
          properties.content = properties.content.source;
        } else {
          /// evaluating special values such as "all".
          properties.content = properties.content === 'all' ? '(?:.|\\s)*?' : regSpecialChars(properties.content);
        }
        properties.groupsNumInside += getGroupsNumInReg(properties.content);
      }
      // properties.test = `${properties.opening}${properties.content}${properties.closing}`;
    } else {
      throw new Error(
        'Error on defining your block, you should define the opening and closing properties as the regex or the text',
      );
    }

    super('Block', 0, [], properties);

    this.openingReg = new RegExp(this.opening);
    this.closingReg = new RegExp(this.closing);
  }

  getRegex(groubIndex, ignoreBlockState) {
    if (this.blockState && !ignoreBlockState) {
      this._blockStateToParents();
      this.id = getRandomName();

      groubIndex = groubIndex || {
        num: 0,
        increase: function (step = 1) {
          this.num += step;
          return this;
        },
      };
      this.realRegex = new RegExp(this.getRegex(null, true));
      this.index = groubIndex.num;

      if (this.content instanceof Rule) {
        this.parser = new Parser(this.childrenRules[0]);
      }

      // rootParser is an instance of "Parser" class, it is defined in the constructor of "Parser" class
      this.rootParser.blocksRules.push(this);
      this.rootParser.blockState = true;

      this.matchIdRegex = new RegExp(`${this.id}${operationBlockChar}\\d+${operationBlockChar}`); // the representing string in the total string
      return `(${this.matchIdRegex.source})`;
    }
    groubIndex = groubIndex || {
      num: 0,
      increase: function (step = 1) {
        this.num += step;
        return this;
      },
    };
    this.index = groubIndex.num;
    let content;
    if (this.content instanceof Rule) {
      content = this.content.getRegex(groubIndex.increase());
    } else {
      groubIndex.increase(this.groupsNumInside + 1);
      content = `(${this.content})`;
    }
    const regex = `${this.opening}${content}${this.closing}`;

    this.regex = regex;
    return `(${regex})`;
  }

  _blockStateToParents() {
    let parent = this.parentRule;
    while (parent) {
      parent.blockState = true;
      parent = parent.parentRule;
    }
  }

  getMatchId(index) {
    return this.id + operationBlockChar + index + operationBlockChar;
  }

  parse(groups, useValue) {
    if (this.blockState) {
      let value = useValue || groups[this.index + 1];
      let args = [];
      const index = value.split(operationBlockChar)[3];
      value = this.rootParser.matches[this.id][index]; // is defined at the rootParser in the paring process

      //#region getting args
      if (this.parser) {
        args = this.parser.parse(value.content);
      }
      //#endregion

      return new Node(this.name, args, {
        match: value.str,
        content: value.content, /// the current group in the array is in the index : this.index + 1
      });
    }
    const value = useValue || groups[this.index + 1];
    let args = [];

    //#region getting args
    if (this.content instanceof Rule) {
      args = this.content.parse(groups);
    } else if (this.parser) {
      args = this.parser.parse(value);
    }
    //#endregion

    return new Node(this.name, args, {
      match: value,
      content: groups[this.index + 2], /// the current group in the array is in the index : this.index + 1
    });
  }
}

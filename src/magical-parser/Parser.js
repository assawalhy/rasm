import { operationBlockChar, regSpecialChars } from './global.js';
import Grammer from './Grammer.js';
import Rule from './rules/Rule.js';
export default class Parser {
  constructor(grammer) {
    this.grammer = grammer instanceof Grammer ? grammer : grammer instanceof Rule ? new Grammer(grammer) : grammer;
    this.blockState = !grammer.blocks || grammer.blocks.length === 0; // on this.prepareRegex();, if any Block Rule can't be searched as regex, this will be true

    this.matchesTest = new RegExp(
      `(${operationBlockChar}\\w+${operationBlockChar})${operationBlockChar}(\\d+)${operationBlockChar}`,
      'g',
    );
    this.matches = [];

    //#region seting the rootParser
    const setRootParser = (rule) => {
      rule.rootParser = this;
      for (const child of rule.childrenRules) {
        setRootParser(child);
      }
    };
    setRootParser(this.grammer);
    //#endregion

    this.prepareRegex();
  }

  prepareRegex() {
    this.regex = new RegExp(`^\\s*${this.grammer.getRegex()}\\s*$`);
  }

  parse(str) {
    if (this.regex && str) {
      //#region getting groups
      let groups;
      if (this.blockState) {
        /**
         * this when a Block in this.grammer can't be searched as regex,
         *  we will use Block.id for searchin them
         */

        //#region brackets
        for (const block of this.blocksRules) {
          const getMatches = (_str, matches, shift = 0) => {
            let openingIndex = _str.search(block.openingReg);
            let closingIndex = _str.search(block.closingReg);
            let contentStart;
            let startIndex;
            let contentEnd;
            let endIndex;
            let length; /// to know the opening or closing string length
            //#region getting the matched string
            if (openingIndex > -1 && closingIndex > -1 && closingIndex > openingIndex) {
              //#region evaluating indexes
              length = 0;
              _str.replace(block.openingReg, (match) => {
                length = match.length;
              });
              startIndex = openingIndex;
              contentStart = openingIndex + length;
              _str = _str.slice(contentStart); // the string after the opening string of the block
              let num = 1;
              /// searching for closing index
              while (num > 0) {
                openingIndex = _str.search(block.openingReg);
                closingIndex = _str.search(block.closingReg);
                if (closingIndex > -1) {
                  if (openingIndex > closingIndex || openingIndex === -1) {
                    // here you are closing
                    num--;
                  } else {
                    // here you are opening new block of the same opening
                    num++;
                  }
                } else {
                  throw new Error('block seams not to be closed, correct it and try again.');
                }
              }

              length = 0;
              _str.slice(closingIndex).replace(block.closingReg, (match) => {
                length = match.length;
              });
              contentEnd = contentStart + closingIndex /* the length of the content */;
              endIndex = contentEnd + length /* the length of the closing string of the block */;
              //#endregion

              //#region here we have our indexes, well done.
              //start is the startingIndex in the origin string, and so for end;
              matches.push({
                str: str.slice(startIndex + shift, endIndex + shift),
                content: str.slice(contentStart + shift, contentEnd + shift),
                start: startIndex + shift,
                end: endIndex + shift,
                contentStart: contentStart + shift,
                contentEnd: contentEnd + shift,
                realIndexes: {
                  start: startIndex + shift,
                  end: endIndex + shift,
                  contentStart: contentStart + shift,
                  contentEnd: contentEnd + shift,
                },
              });
              //#endregion

              // if we are not at the end of the string,,, get match from the reset of the passed _str
              _str = _str.slice(closingIndex + length); // getting the rest of the string
              if (_str !== '') {
                /// myClosingIndex  !== str.length - 1
                getMatches(_str, matches, shift + endIndex);
              }
            }
            //#endregion
          };
          const matches = [];
          getMatches(str, matches);
          this.matches[block.id] = matches;
          for (let i = 0; i < matches.length; i++) {
            // there is matched string in the "str"
            if (block.realRegex.test(matches[i].str)) {
              const id = block.getMatchId(i);
              str = str.slice(0, matches[i].start) + id + str.slice(matches[i].end);
              for (let ii = i + 1; ii < matches.length; ii++) {
                const shift = id.length - matches[i].str.length;
                matches[ii].start += shift;
                matches[ii].end += shift;
                matches[ii].contentStart += shift;
                matches[ii].contentEnd += shift;
              }
            }
          }
        }
        //#endregion
      } /* else {    
            // this is an awesome state, when all blocks can be represented as regex...
            // I wish all the code to be wrapped around by an awesome algorithms and special states
         } */

      str.replace(this.regex, () => {
        groups = arguments;
      });
      if (!groups) throw new Error("your code doesn't match");
      // groups = [...groups];
      groups.pop();
      groups.pop();
      //#endregion

      return this.grammer.parse(groups);
    }
    throw new Error(
      'Ops, there was a problem in parsing process, perhaps your string is not valid for starting parsing, or your grammer is not precise',
    );
  }
}

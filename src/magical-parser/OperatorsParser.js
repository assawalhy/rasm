/**
 * here is the flow chart of the algorithms::: {<https://www.lucidchart.com/invitations/accept/1c02df38-de1b-48da-8942-652652d373ea>}
 * 
 * options include:
 * functions:: if is is applied the expr " 1 + rg(2)" will be considered as " 1 + rg*(2)", thus rg is constants, here we sill consider the functions you insert in addtion to the common functions such as ['sin', 'cos', ...]
 *
 * operators search regex at regexr.com "https://regexr.com/4tbfe"

 */

// import sNode from './sNode';
import Node from './Node.js';
import { checker, contains, getRandomName, throwError } from './global.js';
import { Operator, PrefixOperator, Separator, SuffixOperator } from './tokens/Operators.js';

export default class OperatorsParser {
  constructor(options = {}) {
    this.options = options;
    this.prepareOptions(options);
  }

  prepareOptions(options) {
    const defaultOptions = {
      nameTest: '[_a-zA-Z]+\\d*',
      numTest: '\\d*\\.?\\d+|\\d+\\.?\\d*',
      blocks: [],
      args: [],

      operators: [],
      suffixOperators: [],
      prefixOperators: [],
      separators: [],

      forbiddenChars: [],
    };

    options = Object.assign(defaultOptions, options);
    options.forbiddenChars = [...options.forbiddenChars, ...specialChars];

    //#region all

    //#region string

    let all = {
      operators: '',
      prefixOperators: '',
      suffixOperators: '',
    };

    let processArr = (arr) => {
      if (arr && arr.length > 0) {
        let _all = ' ';
        for (let i = 0; i < arr.length; i++) {
          const op = arr[i];
          let repeated = false;
          _all.replace(new RegExp(`\\(@(${op.regexStr})#(\\d*)\\)`), (match, opName, opIndex) => {
            Object.assign(arr[i], arr[Number.parseInt(opIndex)]); // merging the repeated operators
            arr.splice(Number.parseInt(opIndex), 1); // removing the previous operator wiht the same name
            repeated = true;
            return ` (@${op.toString()},#${i}) `;
          });
          if (!repeated) _all += `(@${op.regexStr}#${i})`;
        }
        return _all;
      }
    };

    all.operators = processArr(options.operators);
    all.prefixOperators = processArr(options.prefixOperators);
    all.suffixOperators = processArr(options.suffixOperators);

    options.all = all;

    //#endregion

    //#region regex

    all = {
      operators: '',
      prefixOperators: '',
      suffixOperators: '',
    };

    processArr = (arr) => {
      if (arr.length === 0) return '';
      if (arr && arr.length > 0) {
        let _all = '';
        for (let i = 0; i < arr.length; i++) {
          const op = arr[i];
          // let repeated = false; /// it is done in string
          _all += `${op.regexStr}|`;
        }
        return _all.slice(0, -1);
      }
    };

    all.operators = processArr(options.operators);
    all.prefixOperators = processArr(options.prefixOperators);
    all.suffixOperators = processArr(options.suffixOperators);

    options.allRegex = all;

    //#endregion

    //#endregion

    //#region final steps

    // sort the array to be inversely according to zIndex property.
    if (options.operators)
      options.operators = options.operators.sort((a, b) => {
        return -(a.zIndex - b.zIndex); // the negative sign is for reverse the array;
      });

    options.blocks = {
      values: options.blocks,
      openedBlock: null,
    };

    //#endregion

    //#region regex for search

    options.rulesRegex = [];

    options.rules.forEach((rule) => {
      options.rulesRegex.push(new RegExp(rule.getRegex()));
    });

    options.nameTestReg = new RegExp(options.nameTest);
    options.numTestReg = new RegExp(options.numTest);

    options.operationTestGrouped = `(?:(${options.nameTest})\\s*)?(${operationBlockChar}${options.nameTest}${operationBlockChar})`;
    options.operationTestGroupedReg = new RegExp(`^\\s*${options.operationTestGrouped}\\s*$`);

    options.operationTest = `(?:${options.nameTest}\\s*)?${operationBlockChar}${options.nameTest}${operationBlockChar}`;
    options.operationTestReg = new RegExp(`^\\s*${options.operationTest}\\s*$`);

    options.matchedTest = operationBlockChar + options.nameTest + operationBlockChar;
    options.matchedTestReg = new RegExp(options.matchedTest, 'g');

    options.argTest = `${options.nameTest}(?:\\s*${operationBlockChar + options.nameTest + operationBlockChar})?|${options.numTest}|${options.operationTest}`;
    options.argTestReg = new RegExp(`^\\s*(${options.argTest})\\s*$`);

    options.opTestReg = new RegExp(
      `^\\s*(${options.allRegex.suffixOperators})?\\s*(${options.allRegex.operators})\\s*(${options.allRegex.prefixOperators})?\\s*(${options.argTest})\\s*`,
    );
    options.opIntialTestReg = new RegExp(`^\\s*(${options.allRegex.prefixOperators})?\\s*(${options.argTest})`);
    options.opFinalTestReg = new RegExp(`^\\s*(${options.allRegex.suffixOperators})\\s*$`);

    options.getMatchedString = (str, operations) =>
      str.replace(options.matchedTestReg, (name) => {
        return operations.get(name).match;
      });

    //#endregion

    return options;
  }

  /**
   * @param {string} str the string to be parsed
   * @param {object} options if you want to override the aleardy existing options
   * @param {array} operations
   */
  parse(str, operations = null) {
    const options = this.options;
    const forbiddenChars = options.forbiddenChars;
    let snode;

    operations = operations instanceof Map ? operations : new Map();
    this.__clonedStr = str;
    this.__realPos = 0;

    //#region pre codes

    // checking errors
    for (let i = 0; i < forbiddenChars.length; i++) {
      if (contains(str, forbiddenChars[i])) throwError(`forbidden char ${forbiddenChars[i]}`);
    }

    // if empty of characters
    str = str.replace(/^\s*$/, () => {
      snode = new Node('');
    });
    if (snode) return snode;

    str = this.__parseBlocks(str, operations);

    for (let i = 0; i < options.rulesRegex.length; i++) {
      str = str.replace(options.rulesRegex[i], () => {
        return;
      });
    }

    str = this.__parseOpertors(str, operations);

    //#endregion

    this.__parse(str, options, operations, { parseBlocks: false, parseOperators: false });
  }

  __parse(str, options, operations, subOptions = {}) {
    subOptions = Object.assign({ parseBlocks: true, parseOperators: true }, subOptions); /// or use Object.assign
    let snode;

    if (subOptions.parseBLocks) {
      str = this.__parseBlocks(str, operations);
    }
    if (subOptions.parseOperators) {
      str = this.__parseBlocks(str, operations);
    }

    //#region final codes

    // if empty of characters
    str = str.replace(/^\s*$/, () => {
      snode = new Node('');
    });
    if (snode) return snode;

    // if name of operation
    str = str.replace(new RegExp(`^\\s*(##${options.nameTest}##)\\s*$`), (match, opName) => {
      snode = operations.get(opName).sNode;
    });
    if (snode) return snode;

    // something.abc.funcName(arg1, ...)
    str = str.replace(
      new RegExp(`^\\s*(${options.nameTest}\\s*\\.\\s*)+(?:(${options.nameTest})\\s*(##${options.nameTest}##))\\s*$`),
      (match, pathTOme, funcName, funcArgs) => {
        const args = operations.get(funcArgs);
        if (options.all.prefixOperators.search(new RegExp(` \\(@(${name}),#(\\d*)\\) `)) > -1) {
          const _arg = operations.get(args);
          const sn = new Node('prefixOperator', _arg, { name });
          operations.set(name, sn);
        } else if (args.sNode.calls('()')) {
          let func;
          const extension = this.parse(pathTOme, operations);
          func = new Node('implementFunction', args.sNode.args, { name: funcName }); // args.sNode.args the args of the bracket  it may be one or more;
          snode = new Node('.', [extension, func], { dotType: 'function', fullName: pathTOme + funcName });
        }
      },
    );
    if (snode) return snode;

    //something.id
    str = str.replace(/^\s*(.*)\.(\$\$[_a-zA-z]+\d*\$\$)\s*$/, (match, pathTOme, id) => {
      if (match) {
        snode = new Node(
          '.',
          [
            this.parse(first, operations),
            new Node('id', [], {
              name: id,
            }),
          ],
          {
            dotType: 'id',
            extension: match,
          },
        );
      }
    });
    if (snode) return snode;

    // if literal, number or variable or bool {true or false}, ...

    str = str.replace(/^\s*(([_a-zA-z]+)\d*)\s*$/, (match, value, notNum) => {
      if (match) {
        snode = new Node(notNum ? 'id' : 'num', [], { value: value });
      }
    });
    if (snode) return snode;

    str = str.replace(/^(-?\d+\.?\d*)|(-?\d*\.?\d+)$/, (match, value, notNum) => {
      if (match) {
        snode = new Node(notNum ? 'id' : 'num', [], { value: value });
      }
    });
    if (snode) return snode;

    throw new Error(`invalid script.\n${str}`); // this shouldn't happen in ordinary cases, but this line of code is here for avoiding any flaw out of measurements

    //#endregion
  }

  __parseBlocks(str, options, operations) {
    //#region brackets

    const blocks = options.blocks;

    let b;

    const repBlock = (match, content) => {
      const name = getRandomName();
      const childArg = b.parser ? b.parser.parse(content) : this.__parse(content, options, operations);
      const sn = new Node('block', childArg, { id: b.id, tokenRef: b });
      operations.set(name, sn);
      return name;
    };

    for (let i = 0; i < blocks.length; i++) {
      b = blocks[i];
      str = str.replace(b.regex, repBlock);
    }

    //#endregion

    return str;
  }

  __parseOperators(str, options, operations) {
    /// RegExp: (var or num or block)(suffix)(op)(prefix)(var or num or block)
    /// ((?:[a-zA-Z_]+\d*)|(?:-?\d+\.?\d*)|(?:-?\d*\.?\d+))\s*((?:\+\+))?\s*((?:\+))\s*((?:\+\+|\+|\-))?\s*((?:[a-zA-Z_]+\d*)|(?:\d+\.?\d*)|(?:\d*\.?\d+))

    //#region separators
    //if (!_contains(str, ...operators)) str = str.replace(/\s/g, '');
    for (const s of options.separators) {
      if (new RegExp(s.regex).test(str)) {
        const name = this.__get;
        const args = [];
        const strs = str.split(s);
        for (const str_ of strs) {
          args.push(this.parse(str_, operations));
        }
        operations.set(name, new Node('separator', args, { name: s, length: args.length }));
      }
    }
    //#endregion

    //#region preparing ofr parsing process
    const argTest = `${options.nameTest}|${options.numTest}|##${options.nameTest}##`;
    const search = new RegExp(
      `^\\s*(${options.allRegex.suffixOperators})?\\s*(${options.allRegex.operators})\\s*(${options.allRegex.prefixOperators})?\\s*(${argTest})\\s*`,
    );
    const intialSearch = new RegExp(`^\\s*(${options.allRegex.prefixOperators})?\\s*(${argTest})`);
    const finalSearch = new RegExp(`^\\s*(${options.allRegex.suffixOperators})\\s*$`);

    let _str = '';
    let prevArg = {
      name: null,
      sn: null,
    };
    //#endregion

    //#region searchong for operators and parsing process
    /// intial replacement
    str = str.replace(intialSearch, (match, prefix, arg) => {
      if (prefix) {
        const a = arg;
        const b = 'prefixOperator';
        const c = prefix;
        if (!isNaN(a)) {
          /// number
          const name = getRandomName();
          const sn = new Node(b, new Node('number', [], { value: Number.parseInt(a) }), { name: c });
          operations.set(name, sn);
          prevArg = { name, sn };
        } else {
          let found = false;
          a.replace(`##${options.nameTest}##`, () => {
            found = true;
          });
          if (found) {
            /// operations
            const sn = new Node(
              b,
              operations.get(a), /// you can get it from operations but let's store it into prevArg.sn to speed our code a litte bit.
              { name: c },
            );
            operations.set(a, sn);
            prevArg.sn = { name: a, sn };
          } else {
            /// varName
            const name = getRandomName();
            const sn = new Node(b, new Node('variable', [], { name: a }), { name: c });
            operations.set(name, sn);
            prevArg = { name, sn };
          }
        }
      } else {
        let found = false;
        arg.replace(`##${options.nameTest}##`, () => {
          found = true;
        });
        if (found) {
          prevArg = { name: arg, sn: operations.get(arg) };
        } else {
          prevArg = { name: arg };
        }
      }

      return '';
    });
    let a;
    while (a !== str) {
      a = str;
      /// if replacement is not implemented, str will sstill the same and while loop will close
      str = str.replace(search, (match, suffix, op, prefix, arg) => {
        if (!op) {
          throwError('operators', 'invalid operators', str, null);
        }

        if (suffix) {
          for (let i = 0; i < options.suffixOperators.length; i++) {
            if (options.suffixOperators[i].regex.test(suffix)) {
              /// creating an operations with type of  prefix operator,,, its arg is the prev arg
              const a = prevArg.name;
              const b = 'suffixOperator';
              const c = suffix;
              if (!isNaN(a)) {
                /// number
                const name = getRandomName();
                const sn = new Node(b, new Node('number', [], { value: Number.parseInt(a) }), { name: c });
                operations.set(name, sn);
                prevArg = { name, sn };
              } else {
                let found = false;
                a.replace(`##${options.nameTest}##`, () => {
                  found = true;
                });
                if (found) {
                  /// operations
                  const sn = new Node(
                    b,
                    prevArg.sn, /// you can get it from operations but let's store it into prevArg.sn to speed our code a litte bit.
                    { name: c },
                  );
                  operations.set(a, sn);
                  prevArg.sn = sn;
                } else {
                  /// varName
                  const name = getRandomName();
                  const sn = new Node(b, new Node('variable', [], { name: a }), { name: c });
                  operations.set(name, sn);
                  prevArg = { name, sn };
                }
              }
            }
          }
        }

        _str += `${prevArg.name} ${op} `;

        if (prefix) {
          const a = arg;
          const b = 'prefixOperator';
          const c = prefix;
          if (!isNaN(a)) {
            /// number
            const name = getRandomName();
            const sn = new Node(b, new Node('number', [], { value: Number.parseInt(a) }), { name: c });
            operations.set(name, sn);
            prevArg = { name, sn };
          } else {
            let found = false;
            a.replace(`##${options.nameTest}##`, () => {
              found = true;
            });
            if (found) {
              /// operations
              const sn = new Node(
                b,
                operations.get(a), /// you can get it from operations but let's store it into prevArg.sn to speed our code a litte bit.
                { name: c },
              );
              operations.set(a, sn);
              prevArg.sn = { name: a, sn };
            } else {
              /// varName
              const name = getRandomName();
              const sn = new Node(b, new Node('variable', [], { name: a }), { name: c });
              operations.set(name, sn);
              prevArg = { name, sn };
            }
          }
        } else {
          let found = false;
          arg.replace(`##${options.nameTest}##`, () => {
            found = true;
          });
          if (found) {
            prevArg = { name: arg, sn: operations.get(arg) };
          } else {
            prevArg = { name: arg };
          }
        }

        return '';
      });
    }
    // final search
    if (str !== '') {
      str = str.replace(finalSearch, (match, suffix) => {
        const a = prevArg.name;
        const b = 'suffixOperator';
        const c = suffix;
        if (!isNaN(a)) {
          /// number
          const name = getRandomName();
          const sn = new Node(b, new Node('number', [], { value: Number.parseInt(a) }), { name: c });
          operations.set(name, sn);
          prevArg = { name, sn };
        } else {
          let found = false;
          a.replace(`##${options.nameTest}##`, () => {
            found = true;
          });
          if (found) {
            /// operations
            const sn = new Node(
              b,
              prevArg.sn, /// you can get it from operations but let's store it into prevArg.sn to speed our code a litte bit.
              { name: c },
            );
            operations.set(a, sn);
            prevArg.sn = { name: a, sn };
          } else {
            /// varName
            const name = getRandomName();
            const sn = new Node(b, new Node('variable', [], { name: a }), { name: c });
            operations.set(name, sn);
            prevArg = { name, sn };
          }
        }

        _str += prevArg.name;

        return '';
      });
      if (str !== '') throwError('operators', 'invalid suffix operator at the end', '', null);
    }
    //#endregion

    return _str;
  }

  //#region deprecated

  //// deprecated // deprecated // deprecated // deprecated // deprecated
  //// deprecated // deprecated // deprecated // deprecated // deprecated
  //// deprecated // deprecated // deprecated // deprecated // deprecated

  // __parseBlocks(str, options, operations) {

  //    //#region brackets
  //    var that = this;
  //    var blocks = options.blocks;

  //    let __parseBlock__ = (index, str_) => {
  //       //// checking error,,, this ill be done on handling bracket's content, so don't do for this.
  //       let name = getRandomName();

  //       // let str_ = str.slice(index.opening, index.closing); /// cut the text from the next sibiling of the opening char until the current closing index
  //       let b = blocks.openedBlock.ref;
  //       let searchingTxt = b.opening + str_ + b.closing;
  //       str = str.replace(searchingTxt, name); // if the replacement is global or not, there will no be any problem unless the developer using this library set a block with the same features as the bolck of our operation name.

  //       let childArg;
  //       if (b.handleContent) {
  //          childArg = that.parse(str_); /// here you are parsing new string with no operations yet. /// getting the sNode from the string inside this bracket block with the same procedures, there is no need to pass operations as argument
  //       } else {
  //          childArg = new Node('undefined', [], { content: str_ }); /// getting the sNode from the string inside this bracket block with the same procedures, there is no need to pass operations as argument
  //       }
  //       let sn = new Node('block', [childArg], { opening: b.opening, closing: b.closing, name: b.name });
  //       operations.set(name, sn);

  //       b.opened = false; blocks.openedBlock = null; // reset

  //       return index.closing + (name.length - searchingTxt.length); /// new_i /// setting the index, as the string may shrink or be taller, it depends on the length of the name
  //    };

  //    let __parseBlocks__ = (i_intial = 0) => {
  //       for (let i = i_intial; i < str.length; i++) {
  //          if (this.__realPos || this.__realPos === 0) this.__realPos += 1; // dealing with the intial str be fore the parsing process
  //          for (let b of blocks) {
  //             /// if a block is opened, closing has the priority, unless, opening has the priority::: you can notice this in ***Mohammed***, if you check the opening char first the num will increase to 2, thus the block will not be closed,,, and an error will occur.
  //             if (blocks.openedBlock) {
  //                if (str.slice(i, i + b.closing.length) === b.closing) {
  //                   if (b !== options.blocks.openedBlock.ref) {

  //                      let iof = options.blocks.openedBlock.ref.opening.indexOf(b.opening);
  //                      if (iof > -1) {
  //                         // options.blocks.openedBlock.ref.opening  contains  b.closing::: for example *** contains **, you can use these blocks formatting typing, **Mohammed** will be bold.
  //                         options.blocks.openedBlock.mayCloseAt = { ref: b, index: i, iof };
  //                      } else {
  //                         b.num--;
  //                      }

  //                   } else {
  //                      b.num--;
  //                   }
  //                } else if (str.slice(i, i + b.opening.length) === b.opening) {
  //                   b.num++;
  //                   i += b.opening.length - 1; // -1 here as for loop will add 1 to i, I want to set the index just after the opening char
  //                   this.__realPos += b.opening.length - 1;
  //                }
  //             } else {
  //                if (str.slice(i, i + b.opening.length) === b.opening) {
  //                   b.num++;
  //                   i += b.opening.length - 1; // -1 here as for loop will add 1 to i, I want to set the index just after the opening char
  //                   this.__realPos += b.opening.length - 1;
  //                   // if (!blocks.openedBlock) { /// if not open, then open
  //                   b.opened = true;
  //                   blocks.openedBlock = { ref: b, index: i };
  //                   // }
  //                } else if (str.slice(i, i + b.closing.length) === b.closing) {
  //                   b.num--;
  //                }
  //             }

  //             /// when a bracket is close, but not opened. e.g. ::: " 1+2-5) "
  //             if (b.num < 0) {
  //                if (b.mustOpen) {
  //                   sendError('closing a block not opened.');
  //                } else {
  //                   b.num = 0;
  //                }
  //             }

  //             /// if true, the bracket's block is defined.
  //             if (b.num === 0 && b.opened) { /// may other brackets' num be zero, as it does not exist or as it is closed but it closed inside the block that we are setting,,, e.g.::: " 1+2({1,2,3}^-1) "
  //                let index = {
  //                   opening: blocks.openedBlock.index + blocks.openedBlock.ref.opening.length,
  //                   closing: i
  //                };
  //                let _str = str.slice(index.opening, index.closing);
  //                if (checker.check(_str, b.content)) {
  //                   i = __parseBlock__(index, _str); /// __parseBlock__ returns the new_i
  //                } else {
  //                   b.num++; // the considered closing found is not compatible, so continue shearching for another closing char
  //                }
  //             }
  //          }
  //       }
  //    };
  //    __parseBlocks__();
  //    /// after finishing looping searching for brackets blocks, oooops, what is this?!!!, oh, the bracket is not closed. send an error
  //    if (blocks.openedBlock) {
  //       if (blocks.openedBlock.mayCloseAt) {
  //          let index = {

  //             opening:
  //                blocks.openedBlock.index +
  //                // blocks.openedBlock.mayCloseAt.ref.opening.length +    this will be added later
  //                blocks.openedBlock.mayCloseAt.iof,

  //             closing: blocks.openedBlock.mayCloseAt.index

  //          };
  //          /// the opening can be for another block e.g.::: (( and (,when we close with )) the blocks is ((content)), otherwise if we close with ) our block is (content) and the second "(" is the first char in the content
  //          blocks.openedBlock.ref.opened = false;
  //          blocks.openedBlock.ref.num = 0;
  //          blocks.openedBlock = { ref: blocks.openedBlock.mayCloseAt.ref, index: index.opening };
  //          index.opening += blocks.openedBlock.mayCloseAt.ref.opening.length;

  //          let _str = str.slice(index.opening, index.closing);
  //          this.__realPos = str.length - 1 - index.closing;
  //          let new_i;
  //          if (checker.check(_str, blocks.openedBlock.mayCloseAt.ref.content)) {
  //             new_i = __parseBlock__(index, _str); /// __parseBlock__ returns the new_i
  //             __parseBlocks__(new_i);
  //          } else {
  //             if (blocks.openedBlock.ref.mustClose) {
  //                sendError('block is not closed.', this.__realPos);
  //             }
  //             // the considered closing found is not compatible as content failed at the test, so continue shearching for another closing char
  //             // so start just after the opening of the openedBlock.ref,,,
  //             // new_i = index.opening;
  //             this.__realPos -= _str.length;
  //             __parseBlocks__(index.opening);
  //          }

  //       } else {
  //          if (blocks.openedBlock.ref.mustClose) {
  //             sendError('block is not closed.', this.__realPos);
  //          } else {
  //             let new_i = blocks.openedBlock.index + blocks.openedBlock.ref.opening.length;
  //             this.__realPos -= (str.length - 1) - new_i;
  //             blocks.openedBlock.ref.opened = false;
  //             blocks.openedBlock = null;
  //             __parseBlocks__(new_i);
  //          }
  //       }
  //    }

  //    //#endregion

  //    return str;

  // }

  //#endregion
}

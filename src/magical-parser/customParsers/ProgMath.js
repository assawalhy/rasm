import Node from '../Node.js';
import { contains, getRandomName, throwError } from '../global.js';
import block from '../tokens/Block.js';
import { Operator, PrefixOperator, Separator, SuffixOperator } from '../tokens/Operators.js';

export default class ProgMathParser {
  constructor(options) {
    this._options = {
      autoMultSign: true,
      vars: [], /// to be used in this case ::: ' 1 + var(2-5)' which is the same as ' 1+ var*(2-5)'
      nameTest: '[a-zA-Z_]+\\d*',
      numTest: '\\d+\\.?\\d*|\\d*\\.?\\d+',

      prefixOperators: [new PrefixOperator({ id: '+' }), new PrefixOperator({ id: '-' })],

      suffixOperators: [
        new SuffixOperator({ id: '!' }),
        new SuffixOperator({ id: 'deg' }),
        new SuffixOperator({ id: 'rad' }),
      ],

      operators: [
        new Operator({ id: '^', zIndex: 10 }), // the first operator to process
        new Operator({ id: '*', zIndex: 9 }),
        new Operator({ id: '/', zIndex: 9 }),
        new Operator({ id: 'mod', zIndex: 9 }),
        new Operator({ id: '+', zIndex: 7 }),
        new Operator({ id: '-', zIndex: 7 }),
        new Operator({ id: '>>', zIndex: 6 }),
        new Operator({ id: '<<', zIndex: 6 }),
        new Operator({ id: '>=', zIndex: 5 }),
        new Operator({ id: '<=', zIndex: 5 }),
        new Operator({ id: '!=', zIndex: 5 }),
        new Operator({ id: '<', zIndex: 5 }),
        new Operator({ id: '>', zIndex: 5 }),
        new Operator({ id: '==', zIndex: 5 }),
        new Operator({ id: '&', zIndex: 4 }),
        new Operator({ id: 'band', zIndex: 4 }),
        new Operator({ id: '|', zIndex: 4 }),
        new Operator({ id: 'bor', zIndex: 4 }),
        new Operator({ id: 'bxor', zIndex: 4 }),
        new Operator({ id: 'constrain', zIndex: 4 }),
        new Operator({ id: 'in', zIndex: 3 }),
        new Operator({ id: 'out', zIndex: 3 }),
        new Operator({ id: 'xnor', zIndex: 1 }),
        new Operator({ id: 'xor', zIndex: 1 }),
        new Operator({ id: 'nand', zIndex: 1 }),
        new Operator({ id: 'nor', zIndex: 1 }),
        new Operator({ id: 'or', zIndex: 1 }),
        new Operator({ id: 'and', zIndex: 1 }),
        new Operator({ id: '||', zIndex: 1 }),
        new Operator({ id: '&&', zIndex: 1 }),
        new Operator({ id: '=', zIndex: 0 }), // the last operator to be applied
      ],

      separators: [new Separator({ id: ';' }), new Separator({ id: ',' })],

      blocks: [
        new block({ id: { opening: '{', closing: '}' } }), /// multiNodable used to know whether or not the bracket block can have multiNode seperated be something like comma ","
        new block({ id: { opening: '[', closing: ']' } }),
        new block({ id: { opening: '(', closing: ')' } }),
        new block({ id: { opening: '"', closing: '"' } }),
        new block({ id: { opening: "'", closing: "'" } }),
      ],

      forbiddenChars: [],
    };
    this.options = options;
  }

  get options() {
    return this._options;
  }

  set options(options) {
    options = Object.assign(this._options, options);
    // prepareOptions(options);
  }

  parse(str, operations = null) {
    const options = this.options;
    operations = operations instanceof Map ? operations : new Map();

    for (let i = 0; i < options.forbiddenChars.length; i++) {
      if (contains(str, options.forbiddenChars[i])) throwError('forbiddenSymbol', 'forbidden symbol.');
    }

    str = str.replace(/\s+/g, () => {
      return ' ';
    });

    return this.__parse(str, options, operations);
  }

  __parse(str, options, operations, subOptions = {}) {
    let snode;
    subOptions = Object.assign({ parseBlocks: true, parseOperators: true }, subOptions); /// or use Object.assign

    // if empty of characters
    str = str.replace(/^\s*$/, () => {
      snode = new Node('');
    });
    if (snode) return snode;

    if (subOptions.parseBlocks) {
      str = this.__parseBlocks(str, options, operations);
    }

    if (subOptions.parseOperators) {
      str = this.__parseOperators(str, options, operations);
    }

    // if name of operation
    str = str.replace(/^\s*(.*)\s*$/, '$1');

    /// if number
    if (!isNaN(str)) {
      snode = new Node('number', [], { value: Number.parseFloat(str) });
    }

    // if operation name
    str = str.replace(options.operationTestReg, (opName) => {
      snode = operations.get(opName);
    });
    if (snode) return snode;

    // if literal (variable) or bool {true or false}, ...
    str = str.replace(options.nameTestReg, (name) => {
      snode = new Node('variable', [], { name });
    });
    if (snode) return snode;

    // this shouldn't happen in ordinary cases, but this line of code is here for avoiding any flaw out of measurements
    throw new Error(`unexpected error for this input: ${str}`);
  }

  /**
   * this modified version of __parseBlocks is much better and faster,,, we have gotten rid of if statements and varaible and alot of code that are redundant
   */
  __parseBlocks(str, options, operations) {
    const blocks = options.blocks;

    let b;
    const repBlock = (match, content) => {
      const name = getRandomName();
      const sn = new Node('block', [this.__parse(content, options, operations)], { id: b.id });
      operations.set(name, sn);
      return name;
    };

    for (let i = 0; i < blocks.values.length; i++) {
      b = blocks.values[i];
      str = str.replace(b.regex, repBlock);
    }

    return str;
  }

  __parseOperators(str, options, operations) {
    /// RegExp: (var or num or block)(suffix)(op)(prefix)(var or num or block)
    /// ((?:[a-zA-Z_]+\d*)|(?:-?\d+\.?\d*)|(?:-?\d*\.?\d+))\s*((?:\+\+))?\s*((?:\+))\s*((?:\+\+|\+|\-))?\s*((?:[a-zA-Z_]+\d*)|(?:\d+\.?\d*)|(?:\d*\.?\d+))

    for (const s of options.separators) {
      if (contains(str, s.id)) {
        const name = this.__get;
        const args = [];
        const strs = str.split(s);
        for (const str_ of strs) {
          args.push(this.__parse(str_, options, operations));
        }
        operations.set(name, new Node('separator', args, { name: s.id, length: args.length }));
      }
    }

    let _str = '';
    let prevArg = {
      name: null,
      sn: null,
    };

    /// intial replacement
    str = str.replace(options.opIntialTestReg, (match, prefix, arg) => {
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
          a.replace(options.operationTestReg, () => {
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
        arg.replace(options.operationTestReg, () => {
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

    let end = false;
    // inner search for operators
    while (!end) {
      end = true;
      /// if replacement is not implemented, str will sstill the same and while loop will close
      str = str.replace(options.opTestReg, (match, suffix, op, prefix, arg) => {
        if (!op) {
          throwError('operators', 'invalid operators', str, null);
        }

        if (suffix) {
          /// creating an operations with type of  prefix operator,,, its arg is the prev arg
          const a = prevArg;
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
            a.replace(options.operationTestReg, () => {
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
            a.replace(options.operationTestReg, () => {
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
          arg.replace(options.operationTestReg, () => {
            found = true;
          });
          if (found) {
            prevArg = { name: arg, sn: operations.get(arg) };
          } else {
            prevArg = { name: arg };
          }
        }

        end = false;
        return '';
      });
    }

    // final search
    if (str !== '') {
      str = str.replace(options.opFinalTestReg, (match, suffix) => {
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
          a.replace(options.operationTestReg, () => {
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
    } else {
      _str += prevArg.name;
    }

    for (let i = 0; i < options.operators.length; i++) {
      end = false;
      while (!end) {
        end = true;
        if (contains(_str, options.operators[i].id)) {
          _str = _str.replace(
            new RegExp(`(${options.argTest})\\s*(${options.operators[i].regexStr})\\s*(${options.argTest})`),
            (match, g1, op, g2) => {
              //#region argument for the operator
              let arg1;
              let arg2;
              if (!isNaN(g1)) {
                /// number
                arg1 = new Node('number', [], { value: Number.parseInt(g1) });
              } else {
                let found = false;
                g1.replace(options.operationTestReg, () => {
                  // operation
                  arg1 = operations.get(g1);
                  found = true;
                });
                if (!found) {
                  /// varName
                  arg1 = new Node('variable', [], { name: g1 });
                }
              }
              if (!isNaN(g2)) {
                /// number
                arg2 = new Node('number', [], { value: Number.parseInt(g2) });
              } else {
                let found = false;
                g2.replace(options.operationTestReg, () => {
                  // operation
                  arg2 = operations.get(g2);
                  found = true;
                });
                if (!found) {
                  /// varName
                  arg2 = new Node('variable', [], { name: g2 });
                }
              }
              //#endregion
              const name = getRandomName();
              operations.set(name, new Node('operator', [arg1, arg2], { name: op }));
              end = false;
              return name;
            },
          );
        }
        /// if the operator is not found,,, end the while loop.
      }
    }

    return _str;
  }
}

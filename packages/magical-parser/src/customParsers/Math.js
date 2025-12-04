import Node from '../Node.js';
import { contains, getRandomName, operationBlockChar, throwError, specialChars } from '../global.js';
import Block from '../tokens/Block.js';
import { Operator, PrefixOperator, Separator, SuffixOperator } from '../tokens/Operators.js';

export default class MathParser {
  constructor() {
    this.options = this.prepareOptions({
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
        new Operator({ id: '.', zIndex: 11 }), // the first operator to process
        new Operator({ id: '^', zIndex: 10 }), // the 2nd operator to process
        new Operator({ id: '**', zIndex: 10 }), // the 2nd operator to process
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
        new Block({ id: /\(([^(]*?)\)/, opening: '(', closing: ')' }),
        new Block({ id: /\{([^{]*?)\}/, opening: '{', closing: '}' }),
        new Block({ id: /\[([^[]*?)\]/, opening: '[', closing: ']' }),
        new Block({ id: /"(.*?|\\")*"/, opening: '"', closing: '"' }), /// string: ""
        new Block({ id: /'(.*?|\\')*'/, opening: "'", closing: "'" }), /// string: ''
      ],

      forbiddenChars: [],
    });
  }

  prepareOptions(options) {
    const defaultOptions = {
      nameTest: '[_a-zA-Z]+\\d*',
      numTest: '\\d*\\.?\\d+|\\d+\\.?\\d*',

      operators: [],
      suffixOperators: [],
      prefixOperators: [],
      separators: [],

      blocks: [],
      rules: [],

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

    options.matchedTest = `${operationBlockChar}\\w+${operationBlockChar}`;
    options.matchedTestReg = new RegExp(options.matchedTest, 'g');

    options.operationTestGrouped = `(?:(${options.nameTest})\\s*)?(${options.matchedTest})`;
    options.operationTestGroupedReg = new RegExp(`^\\s*${options.operationTestGrouped}\\s*$`);

    options.operationTest = `(?:${options.nameTest}\\s*)?${options.matchedTest}`;
    options.operationTestReg = new RegExp(`^\\s*${options.operationTest}\\s*$`);

    options.argTest = `${options.nameTest}(?:\\s*${options.matchedTest})?|${options.numTest}|${options.operationTest}`;
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

  //#endregion

  parse(str, operations = null) {
    const options = this.options;
    operations = operations instanceof Map ? operations : new Map();
    //#region pre codes
    for (let i = 0; i < options.forbiddenChars.length; i++) {
      if (contains(str, options.forbiddenChars[i])) throwError('forbiddenSymbol', 'forbidden symbol.');
    }
    // // if empty
    // str = str.replace(/\s+/g, () => {
    //    return ' ';
    // });

    //#endregion
    return this.__parse(str, options, operations);
  }

  __parse(str, options, operations, subOptions = {}) {
    subOptions = Object.assign({ parseBlocks: true, parseOperators: true }, subOptions); /// or use Object.assign

    // if empty of characters
    let snode;
    str = str.replace(/^\s*$/, () => {
      snode = new Node('', [], { match: str });
    });
    if (snode) return snode;

    if (subOptions.parseBlocks) {
      str = this.__parseBlocks(str, options, operations);
    }
    if (subOptions.parseOperators) {
      str = this.__parseOperators(str, options, operations);
    }
    const returnedValue = this.__parseArg(str, options, operations);
    returnedValue.match = returnedValue.match || options.getMatchedString(str, operations);
    return returnedValue;
  }

  /**
   * this modified version of __parseBlocks is much better and faster,,, we have gotten rid of if statements and varaible and alot of code that are redundant
   */
  __parseBlocks(str, options, operations) {
    //#region brackets
    const blocks = options.blocks;

    let b;
    let end; // for while loop in replacing

    const repBlock = (match, content) => {
      const name = getRandomName();
      let args = [];
      if (b.parser) {
        if (b.parser === 'inherit') {
          args = [this.__parse(content, options, operations)];
        } else {
          args = [b.parser(content)];
        }
      }
      const sn = new Node('block', args, {
        name: b.name,
        match: options.getMatchedString(match, operations),
        content: options.getMatchedString(content, operations),
      });
      operations.set(name, sn);
      end = false;
      return name;
    };

    for (let i = 0; i < blocks.values.length; i++) {
      b = blocks.values[i];
      end = false;
      while (!end) {
        end = true;
        str = str.replace(b.regex, repBlock);
      }
    }

    return str;
  }

  __parseOperators(str, options, operations) {
    /// RegExp: (arg)(suffix)(op)(prefix)(arg)
    /// ((?:[a-zA-Z_]+\d*)|(?:-?\d+\.?\d*)|(?:-?\d*\.?\d+))\s*((?:\+\+))?\s*((?:\+))\s*((?:\+\+|\+|\-))?\s*((?:[a-zA-Z_]+\d*)|(?:\d+\.?\d*)|(?:\d*\.?\d+))

    //#region separators
    for (const s of options.separators) {
      if (contains(str, s.id)) {
        const name = getRandomName();
        const args = [];
        const strs = str.split(s);
        for (const str_ of strs) {
          args.push(this.__parse(str_, options, operations));
        }
        operations.set(
          name,
          new Node('separator', args, {
            name: s.name,
            length: args.length,
            match: options.getMatchedString(str, operations),
          }),
        );
        return name;
      }
    }
    //#endregion

    //#region preparing for parsing process
    let _str = '';
    let prevArg = null;
    //#endregion

    //#region searching for operators and parsing suffix and prefix
    /// intial replacement
    str = str.replace(options.opIntialTestReg, (match, prefix, arg) => {
      if (prefix) {
        const name = getRandomName();
        const sn = new Node('prefixOperator', this.__parseArg(arg, options, operations), {
          name: prefix,
          match: options.getMatchedString(match, operations),
        });
        operations.set(name, sn);
        prevArg = name;
      } else {
        prevArg = arg;
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
          /// creating an operations with type of suffix operator,,, its arg is the prev arg
          const name = getRandomName();
          const sn = new Node('suffixOperator', this.__parseArg(prevArg, options, operations), {
            name: suffix,
            match: options.getMatchedString(prevArg + suffix, operations),
          });
          operations.set(name, sn);
          prevArg = name;
        }

        _str += `${prevArg} ${op} `;

        if (prefix) {
          /// creating an operations with type of prefix operator,,, its arg is the prev arg
          const name = getRandomName();
          const sn = new Node('prefixOperator', this.__parseArg(arg, options, operations), {
            name: prefix,
            match: options.getMatchedString(prefix + arg, operations),
          });
          operations.set(name, sn);
          prevArg = name;
        } else {
          prevArg = arg;
        }

        end = false;
        return '';
      });
    }

    // final search
    if (str !== '') {
      str = str.replace(options.opFinalTestReg, (match, suffix) => {
        const name = getRandomName();
        const sn = new Node('suffixOperator', this.__parseArg(prevArg, options, operations), {
          name: suffix,
          match: options.getMatchedString(prevArg + match, operations),
        });
        operations.set(name, sn);
        _str += name;
        return '';
      });
      if (str !== '') throwError('operators', 'invalid suffix operator at the end', '', null);
    } else {
      _str += prevArg;
    }
    //#endregion

    end = options.argTestReg.test(_str);

    //#region parsing operators
    if (!end) {
      for (let i = 0; i < options.operators.length; i++) {
        end = false;
        while (!end) {
          end = true;
          if (contains(_str, options.operators[i].id)) {
            _str = _str.replace(
              new RegExp(`(${options.argTest}) (${options.operators[i].regexStr}) (${options.argTest})`),
              (match, g1, op, g2) => {
                const arg1 = this.__parseArg(g1, options, operations);
                const arg2 = this.__parseArg(g2, options, operations);
                const name = getRandomName();
                operations.set(
                  name,
                  new Node('operator', [arg1, arg2], {
                    name: op,
                    match: options.getMatchedString(match, operations),
                  }),
                );
                end = false;
                return name;
              },
            );
          }
          /// if the operator is not found,,, end the while loop.
        }
      }
    }
    //#endregion

    return _str;
  }

  __parseArg(str, options, operations) {
    //#region the last thing in str,,, number or name or operationName
    let snode;

    // if name of operation
    str = str.replace(/^\s*(.*)\s*$/, '$1');

    /// if number
    if (!isNaN(str)) {
      snode = new Node('number', [], {
        value: Number.parseFloat(str),
        match: str,
      });
    }
    if (snode) return snode;

    // if operation name
    str = str.replace(options.operationTestGroupedReg, (match, funcName, opName) => {
      snode = operations.get(opName);
      if (funcName && snode.type === 'block' && snode.name === '()') {
        if (options.vars.find((v) => v === funcName)) {
          //
        }
        snode = new Node('functionCalling', snode.args, {
          name: funcName,
          match: options.getMatchedString(match, operations),
        });
      } else if (funcName) {
        throw new Error('you have inputted a name (identifier) then an invalid block after it.');
      }
    });
    if (snode) return snode;

    // if literal (variable) or bool {true or false}, ...
    str = str.replace(options.nameTestReg, (name) => {
      snode = new Node('variable', [], { name, match: str });
    });
    if (snode) return snode;

    //#endregion

    // this shouldn't happen in ordinary cases, but this line of code is here for avoiding any flaw out of measurements
    throw new Error(`invalid script.\n${str}`);
  }
}

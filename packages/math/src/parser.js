import { Node } from '@rasm/magical-parser';
import MathParser from '@rasm/magical-parser/customParsers/Math.js';
import { tex2max } from './tex2max';

const mathParser = new MathParser();

/**
 *
 * @param {Node} parsed
 * @param {Array} params
 * @param {String} math is the math object containing the functions and the variables that is not a parameter.
 * @param {Boolean} strict
 */
export function parsedTOjsFunction(parsed, params = [], math = 'Math', strict = true) {
  const undef = { vars: [], funcs: [] };
  const func = new Function(
    ...params,
    `${strict ? '"use strict";\n' : ''}return ${__generateJS(parsed, params, math, undef)};`,
  );
  undef.vars = undef.vars.reduce((b, a) => {
    if (!b.find((e) => e === a)) b.push(a);
    return b;
  }, []);
  undef.funcs = undef.funcs.reduce((b, a) => {
    if (!b.find((e) => e === a)) b.push(a);
    return b;
  }, []);
  return { func, undef };
}

export function __generateJS(parsed, params = [], math = 'Math', undef = null) {
  if (parsed.type === 'number') {
    return parsed.value;
  }
  if (parsed.type === 'functionCalling') {
    switch (parsed.name) {
      case 'sum': {
        if (
          !parsed.args[0].check({ type: 'separator', name: ',', length: 4 }) ||
          !parsed.args[0].args[1].type === 'variable'
        )
          throw new Error(`sum export function has not valid arguments: "${parsed.match}"`);
        const sumParam = parsed.args[0].args[1].name;
        const newParams = [...params];
        newParams.push(sumParam);
        const sumExpr = __generateJS(parsed.args[0].args[0], newParams, math, undef);
        const start = __generateJS(parsed.args[0].args[2], params, math, undef);
        const end = __generateJS(parsed.args[0].args[3], params, math, undef);
        return `(()=>{
                let _ = 0;
                for(let ${sumParam} = ${start}; ${sumParam} <= ${end}; ${sumParam}++){
                   _ += ${sumExpr};
                }
                return _;
             })()`;
      }
      default:
        if (params.find((param) => parsed.name === param)) {
          return `${parsed.name}(${__generateJS(parsed.args[0], params, math, undef)})`;
        }
        if (!Object.prototype.hasOwnProperty.call(window[math], parsed.name)) undef.funcs.push(parsed.name);
        return `${math}.${parsed.name}(${__generateJS(parsed.args[0], params, math, undef)})`;
    }
  }
  if (parsed.type === 'variable') {
    if (params.find((param) => parsed.name === param)) {
      return parsed.name;
    }
    if (!Object.prototype.hasOwnProperty.call(window[math], parsed.name)) undef.vars.push(parsed.name);
    return `${math}.${parsed.name}`;
  }
  if (parsed.type === 'block') {
    let opening;
    let closing;
    switch (parsed.name) {
      case '()':
        opening = '(';
        closing = ')';
        break;
      case '[]':
        opening = '[';
        closing = ']';
        break;
      case '{}':
        opening = '{';
        closing = '}';
        break;
    }
    return opening + __generateJS(parsed.args[0], params, math, undef) + closing;
  }
  if (parsed.type === 'operator') {
    switch (parsed.name) {
      case '.':
        return `${__generateJS(parsed.args[0], params, math, undef)}.${parsed.args[1].match}`;
      case '^':
        return `${__generateJS(parsed.args[0], params, math, undef)} ** ${__generateJS(parsed.args[1], params, math, undef)}`;
      case '=':
        return `${__generateJS(parsed.args[0], params, math, undef)} == ${__generateJS(parsed.args[1], params, math, undef)}`;
      default:
        return `${__generateJS(parsed.args[0], params, math, undef)} ${parsed.name} ${__generateJS(parsed.args[1], params, math, undef)}`;
    }
  }
  if (parsed.type === 'suffixOperator') {
    switch (parsed.name) {
      case '!':
        return `Math.fact(${__generateJS(parsed.args[0], params, math, undef)})`;
      default:
        return __generateJS(parsed.args[0], params, math, undef) + parsed.name;
    }
  }
  if (parsed.type === 'prefixOperator') {
    return parsed.name + __generateJS(parsed.args[0], params, math, undef);
  }
  if (parsed.type === 'separator') {
    const args = [];
    for (const arg of parsed.args) {
      args.push(__generateJS(arg, params, math, undef));
    }
    return args.join(`${parsed.name} `);
  }
  return parsed.match;
}

export function latexTOmaxima(tex) {
  return new tex2max().toMaxima(tex);
}

export function latexTOnode(tex) {
  return parserNodeTOnode(mathParser.parse(latexTOmaxima(tex)));
}

export function latexTOjsfunction(tex, params = [], noparse = false) {
  return maximaTOjsFunction(latexTOmaxima(tex), params, noparse);
}

export function maximaTOnode(str) {
  return parserNodeTOnode(mathParser.parse(str));
}
export function maximaTOjsFunction(str, params = [], math = 'Math', strict = true) {
  return parsedTOjsFunction(mathParser.parse(str), params, math, strict);
}

export function maximaTOlatex(str) { }

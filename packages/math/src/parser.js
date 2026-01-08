import latexParser from '@scicave/math-latex-parser';

export { latexParser };

/**
 *
 * @param {latexParser.Node} parsed
 * @param {Array} params
 * @param {String} math is the math object containing the functions and the variables that is not a parameter.
 * @param {Boolean} strict
 */
export function parsedTOjsFunction(parsed, params = [], math = 'Math', strict = true) {
  const undef = { vars: [], funcs: [] };
  const jsContent = __generateJS(parsed, params, math, undef);
  const func = new Function(...params, `${strict ? '"use strict";\n' : ''}return ${jsContent};`);
  undef.vars = [...new Set(undef.vars)];
  undef.funcs = [...new Set(undef.funcs)];
  return { func, undef };
}

export function __generateJS(node, params = [], math = 'Math', undef = null) {
  if (!node) return '';

  switch (node.type) {
    case 'number':
      return node.value;

    case 'id':
      if (params.includes(node.name)) {
        return node.name;
      }
      if (undef) {
        const mathObj =
          typeof window !== 'undefined' ? window[math] : typeof global !== 'undefined' ? global[math] : null;
        if (mathObj && !Object.prototype.hasOwnProperty.call(mathObj, node.name)) {
          undef.vars.push(node.name);
        }
      }
      return `${math}.${node.name}`;

    case 'automult':
      return `(${node.args.map((arg) => __generateJS(arg, params, math, undef)).join(' * ')})`;

    case 'sum': {
      // args: [lower, upper, expression]
      const [lower, upper, expr] = node.args;
      let sumVar = 'i';
      let startVal = '0';

      if (lower) {
        if (lower.check({ type: 'operator', name: '=' })) {
          sumVar = lower.args[0].name;
          startVal = __generateJS(lower.args[1], params, math, undef);
        } else {
          startVal = __generateJS(lower, params, math, undef);
          // Try to guess sumVar from expression if it's not in params
          const ids = [];
          const collectIds = (n) => {
            if (!n) return;
            if (n.checkType('id')) ids.push(n.name);
            if (n.args) n.args.forEach((arg) => collectIds(arg));
          };
          collectIds(expr);
          const potential = ids.find((id) => !params.includes(id));
          if (potential) sumVar = potential;
        }
      }

      const endVal = upper ? __generateJS(upper, params, math, undef) : 'Infinity';
      const newParams = [...params, sumVar];
      const sumExpr = __generateJS(expr, newParams, math, undef);

      return `((_start, _end) => {
          let _sum = 0;
          for(let ${sumVar} = _start; ${sumVar} <= _end; ${sumVar}++){
             _sum += ${sumExpr};
          }
          return _sum;
       })(${startVal}, ${endVal})`;
    }

    case 'function':
      switch (node.name) {
        case 'sum': {
          // Expected sum(expr, var, start, end)
          // In this parser, sum(a,b,c,d) -> args: [ block { args: [a,b,c,d] } ]
          const argsNode = node.args[0];
          if (argsNode?.checkType('block') && argsNode.args.length === 4) {
            const [exprNode, varNode, startNode, endNode] = argsNode.args;
            if (!varNode.checkType('id')) throw new Error('Sum second argument must be a variable name');

            const sumParam = varNode.name;
            const newParams = [...params, sumParam];
            const sumExpr = __generateJS(exprNode, newParams, math, undef);
            const start = __generateJS(startNode, params, math, undef);
            const end = __generateJS(endNode, params, math, undef);

            return `((_start, _end) => {
                let _sum = 0;
                for(let ${sumParam} = _start; ${sumParam} <= _end; ${sumParam}++){
                   _sum += ${sumExpr};
                }
                return _sum;
             })(${start}, ${end})`;
          }
          break;
        }
      }
      {
        const actualArgs = node.args[0]?.checkType('block') ? node.args[0].args : node.args;
        const jsArgs = actualArgs.map((arg) => __generateJS(arg, params, math, undef)).join(', ');

        if (params.includes(node.name)) {
          return `${node.name}(${jsArgs})`;
        }

        if (undef) {
          const mathObj =
            typeof window !== 'undefined' ? window[math] : typeof global !== 'undefined' ? global[math] : null;
          if (mathObj && !Object.prototype.hasOwnProperty.call(mathObj, node.name)) {
            undef.funcs.push(node.name);
          }
        }
        return `${math}.${node.name}(${jsArgs})`;
      }

    case 'operator': {
      const left = node.args[0] ? __generateJS(node.args[0], params, math, undef) : '';
      const right = node.args[1] ? __generateJS(node.args[1], params, math, undef) : '';

      if (node.operatorType === 'infix') {
        let op = node.name;
        if (op === '^') op = '**';
        if (op === '=') op = '==';
        return `(${left} ${op} ${right})`;
      }
      if (node.operatorType === 'prefix') {
        return `(${node.name}${left || right})`;
      }
      if (node.operatorType === 'postfix') {
        if (node.name === '!') {
          return `${math}.fact(${left})`;
        }
        return `(${left}${node.name})`;
      }
      return '';
    }

    case 'block':
    case 'parentheses':
      return `(${__generateJS(node.args[0], params, math, undef)})`;

    case 'frac':
      return `(${__generateJS(node.args[0], params, math, undef)} / ${__generateJS(node.args[1], params, math, undef)})`;

    case 'sqrt':
      return `${math}.sqrt(${__generateJS(node.args[0], params, math, undef)})`;

    case 'abs':
      return `${math}.abs(${__generateJS(node.args[0], params, math, undef)})`;

    default:
      if (node.match?.text) return node.match.text;
      return '';
  }
}

export function latexTOnode(tex) {
  return latexParser.parse(tex);
}

export function latexTOjsfunction(tex, params = [], strict = true) {
  return parsedTOjsFunction(latexParser.parse(tex), params, 'Math', strict);
}

// Keep these for backward compatibility if needed, but they just point to the same logic
export const maximaTOnode = latexTOnode;
export const maximaTOjsFunction = (str, params = [], math = 'Math', strict = true) =>
  parsedTOjsFunction(latexParser.parse(str), params, math, strict);
export const latexTOmaxima = (tex) => tex; // Identity since we no longer need maxima conversion

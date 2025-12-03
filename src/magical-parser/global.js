import * as Errors from './errors.js';

export function regSpecialChars(str) {
  return str.replace(/[+*/.$^(){|}[\]]/g, (match) => {
    return `\\${match}`;
  });
}

export function strTOreg(str) {
  return new RegExp(regSpecialChars(str));
}

export function getGroupsNumInReg(reg) {
  let groupsNum = 0;
  /// reg .source == reg.toString().slice(1, ((reg) => { let num = reg.length - 1; while (reg[num] !== '/') num--; return num; })(reg.toString()))
  let regStr = reg instanceof RegExp ? reg.source : reg;

  if (regStr === '') return 0;

  regStr = regStr
    .replace(/\\./g, '')
    // .replace(/\\\(|\\\)/, '')
    .replace(/^([^(])+/, '');

  if (regStr === '') return 0;

  /// regStr[0] === '(' should be (

  //#region get content of the group

  //#endregion

  if (regStr.indexOf('(') > -1) {
    let num = 1;
    for (let i = 1; i < regStr.length; i++) {
      if (regStr[i] === ')') {
        num--;
      } else if (regStr[i] === '(') {
        num++;
      }
      if (num === 0) {
        // the group is closed
        const content = regStr.slice(1, i);
        if (regStr.slice(1, 3) !== '?:') groupsNum++;
        groupsNum += getGroupsNumInReg(content);
        regStr = regStr.slice(i + 1);
        groupsNum += getGroupsNumInReg(regStr);
        break;
      }
    }
  }

  return groupsNum || 0;
}

export const specialRegex = {
  regSpecialChars: /[+*/.$^(){}[\]]/,
  num: /(-?\d+\.?\d*)|(-?\d*\.?\d+)/,
  id: /[a-zA-Z_]+\d*/,
  // var: // var is removed as you should care about other letters in other langs that I don't know how to check for using regex
};

export const checker = {
  symbols: '!"\'#$%&()*+,-./:;<=>?@[\\]^_`{|}~€‚„…†‡ˆ‰‹‘’“”•–—˜™›¡¢£¤¥¦§¨©«¬®¯°±²³´¶·¸¹º»¼½¾¿×÷',

  isSymbol: (c) =>
    /(?:[$+<->^`|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20BF\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B98-\u2BFF\u2CE5-\u2CEA\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uFB29\uFBB2-\uFBC1\uFDFC\uFDFD\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9B\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD10-\uDD6C\uDD70-\uDDAC\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED5\uDEE0-\uDEEC\uDEF0-\uDEFA\uDF00-\uDF73\uDF80-\uDFD8\uDFE0-\uDFEB]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDD00-\uDD0B\uDD0D-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDE53\uDE60-\uDE6D\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])/.test(
      c,
    ),

  isEmoji: (c) =>
    /(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])/.test(
      c,
    ),

  isWhiteSpace: (c) => /[\t-\r \x85\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/.test(c),

  isNum: (c) => !isNaN(c),

  isAlpha: (c) => !isNaN(c) && !checker.isSymbol(c),

  spaced: (c) => !checker.isSymbol(c),

  isVarName: function (str) {
    let isvarname = true;
    str.replace(/^\s*(.*)\d*\s*$/, (match, g1) => {
      for (const c of g1) {
        isvarname = this.isAlpha(c) || c === '_';
        if (!isvarname) continue;
      }
    });
  },

  check: function (str, test) {
    switch (test) {
      case 'name':
        return this.isVarName(str);
      case 'num':
        return !isNaN(str);
      case 'all':
        return true;
      default:
        if (test instanceof RegExp) {
          return test.test(str);
        }
        console.log(`checking test "${test}" is not supported.`);
        return true;
    }
  },
};

export function sendError(type, msg, str = '', pos = undefined) {
  // (new Array(pos)).fill('_')     is the same as     '_'.repeat(pos)
  str = str || '';
  str = str === '' ? '' : `\n${str}\n`;
  if (!isNaN(pos)) {
    pos = `${new Array(pos).fill('_').join('')}^`;
  } else if (pos) {
    // here the text in parsing process is multi line.
    pos = `position: ${pos}`;
  } else {
    // pos is a falsy value
    pos = '';
  }
  msg = msg + str + pos;

  switch (type) {
    case 'forbiddenChars':
      throw new Errors.forbiddenSymbolsError(msg);
    case 'operators':
      throw new Errors.operatorsError(msg);
    case 'blocks':
      throw new Errors.blocksError(msg);
    default:
      throw new Error(msg);
  }
}

export function contains(str, containedStr) {
  return str.indexOf(containedStr) > -1;
}

export function getRandomName() {
  const num = 0;
  /// randomNameNum is here to avoid getting the same random name if the code is implemented so fast

  return (
    getRandomName.operationBlockChar +
    (Date.now() + getRandomName.randomNameNum++).toString(36) +
    getRandomName.operationBlockChar
  );
}
getRandomName.randomNameNum = 0;
getRandomName.operationBlockChar = '¶';

export const operationBlockChar = '¶';

export const specialChars = [operationBlockChar];

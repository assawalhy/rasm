export const mathQuill = MathQuill.getInterface(2);

mathQuill.config({
  sumStartsWithNEquals: true,
  supSubsRequireOperand: true,
  // charsThatBreakOutOfSupSub: '+-=<>',
  autoSubscriptNumerals: true,
  autoCommands: 'pi theta sqrt abs floor ceil round random sum int prod',
  // // autoOperatorNames: '',
  maxDepth: 10,
});
export class forbiddenSymbolsError extends Error {
  constructor(msg, pos) {
    super(msg);
    this.position = pos;
    this.messsege = msg;
  }
}

export class operatorsError extends Error {
  constructor(msg, pos) {
    super(msg);
    this.position = pos;
    this.messsege = msg;
  }
}

export class blocksError extends Error {
  constructor(msg, pos) {
    super(msg);
    this.position = pos;
    this.messsege = msg;
  }
}

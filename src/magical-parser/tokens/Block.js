import * as global from '../global.js';

// For example brackets and quotations
// { opening: '{', closing: '}', num: 0, opened: false}

class Block {
  constructor(options = {}) {
    options = Object.assign(
      {
        parser: 'inherit',
      },
      options,
    );

    Object.assign(this, options);

    if (!this.opening || !this.closing) {
      throw new Error('you must set the opening and the closing of the block');
    }

    this.opened = false;
    this.num = 0;
  }

  get id() {
    return this._id;
  }

  set id(val) {
    if (val instanceof RegExp) {
      this._id = val;
      this.regex = val;
      this.regexStr = val.source;
    } else if (val instanceof Object) {
      this._id = val;
      this.opening = this.id.opening;
      this.closing = this.id.closing;

      if (val.opening && val.closing) {
        val.content = val.content || 'all';

        if (val.content instanceof RegExp) {
          val.content = val.content.source;
        } else if (val.content === 'all') {
          val.content = '(?:.*?|\\s*)*?';
        } else {
          val.content = global.regSpecialChars(val.content);
        }

        this.regexStr = `${global.regSpecialChars(val.opening)}(${val.content})${global.regSpecialChars(val.closing)}`;
        this.regex = new RegExp(this.regexStr);
      }
    } else {
      this._id = val;
      this.regex = new RegExp(global.regSpecialChars(val));
      this.regexStr = this.regex.source;
    }

    // Setting the regex to be global
    if (!this.regex.global) {
      this.regex = new RegExp(this.regex.source, `${this.regex.flags || ''}g`);
    }
  }

  get name() {
    if (!this._name) return this.opening + this.closing;
    return this._name;
  }

  set name(name) {
    this._name = name;
  }

  get content() {
    return this._contentTest || 'all';
  }

  set content(val) {
    this._contentTest = val;
  }
}

export default Block;

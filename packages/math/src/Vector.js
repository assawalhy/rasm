import Angles from "./Angles.js";

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static fromAngle(angle, mag = 1) {
    return new Vector(mag * Math.cos(angle), mag * Math.sin(angle));
  }

  get mag() {
    return (this.x ** 2 + this.y ** 2) ** 0.5;
  }

  get angle() {
    return Angles.angle(new Vector(1, 0), this);
  }

  /**
   * your parameter v is either vector or number.
   * @param {Vector} v
   * @param {number} v
   */
  add(v) {
    if (v instanceof Vector) {
      return new Vector(this.x + v.x, this.y + v.y);
    }
    if (!isNaN(v)) {
      return new Vector(this.x + v, this.y + v);
    }

    throw new Error('your param is not valid.');
  }

  /**
   * your parameter v is either vector or number.
   * @param {Vector} v
   * @param {number} v
   */
  subtract(v) {
    if (v instanceof Vector || v instanceof Object) {
      return new Vector(this.x - v.x, this.y - v.y);
    }
    if (!isNaN(v)) {
      return new Vector(this.x - v, this.y - v);
    }

    throw new Error('your param is not valid.');
  }

  /**
   * your parameter v is  or number.
   * @param {number} v
   */
  mult(v) {
    if (!isNaN(v)) {
      return new Vector(this.x * v, this.y * v);
    }

    throw new Error('your param is not valid.');
  }

  /**
   * @param {Vector} v
   */
  dot(v) {
    if (v instanceof Vector) {
      return this.x * v.x + this.y * v.y;
    }

    throw new Error('your param is not valid.');
  }

  rotate(a) {
    a += this.angle;
    return new Vector(this.mag * Math.cos(a), this.mag * Math.sin(a));
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }

  toArray() {
    return [this.x, this.y];
  }
}

export default Vector;

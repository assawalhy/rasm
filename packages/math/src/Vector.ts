import Angles from './Angles';

class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromAngle(angle: number, mag = 1): Vector {
    return new Vector(mag * Math.cos(angle), mag * Math.sin(angle));
  }

  get mag(): number {
    return (this.x ** 2 + this.y ** 2) ** 0.5;
  }

  get angle(): number {
    return Angles.angle(new Vector(1, 0), this);
  }

  add(v: Vector | number): Vector {
    if (v instanceof Vector) {
      return new Vector(this.x + v.x, this.y + v.y);
    }
    if (typeof v === 'number') {
      return new Vector(this.x + v, this.y + v);
    }

    throw new Error('your param is not valid.');
  }

  subtract(v: Vector | { x: number; y: number } | number): Vector {
    if (v instanceof Vector || (typeof v === 'object' && v !== null && 'x' in v && 'y' in v)) {
      const other = v as { x: number; y: number };
      return new Vector(this.x - other.x, this.y - other.y);
    }
    if (typeof v === 'number') {
      return new Vector(this.x - v, this.y - v);
    }

    throw new Error('your param is not valid.');
  }

  mult(v: number): Vector {
    if (typeof v === 'number') {
      return new Vector(this.x * v, this.y * v);
    }

    throw new Error('your param is not valid.');
  }

  dot(v: Vector): number {
    if (v instanceof Vector) {
      return this.x * v.x + this.y * v.y;
    }

    throw new Error('your param is not valid.');
  }

  rotate(a: number): Vector {
    const newAngle = a + this.angle;
    return new Vector(this.mag * Math.cos(newAngle), this.mag * Math.sin(newAngle));
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }
}

export default Vector;

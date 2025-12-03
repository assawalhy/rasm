import Vector from './Vector.js';

//#region relates to lines

/**
 * returns the distance to a line whose equation instanceof 'a*x + b*y + c = 0'.
 * @param {Vector} v instanceof Vector
 * @param {number} a param of x in 'a*x + b*y + c = 0'.
 * @param {number} b param of y in 'a*x + b*y + c = 0'.
 * @param {number} c the absolute in 'a*x + b*y + c = 0'.
 * @param {number} angle instanceof the sloop angle of the line from 0 to 2*Pi
 * @param {number} trans instanceof the translation of the line according to the orign point.
 */
export function distToLine(v, le) {
  if (v) {
    return Math.abs(le.a * v.x + le.b * v.y + le.c) / Math.sqrt(le.a ** 2 + le.b ** 2);
  }
}

/**
 * return the lineIntersection of the line which equation instanceof a1*x + b1*x + c1 and the perpendiuclar line crossing through v
 * @param {Object} le instanceof {a: ___, b: ___, c: ___} in "a*x+b*y+c=0"
 */
export function projectionToLine(v, le) {
  if (v && le) {
    return lineIntersection(le, lineEquation(le.angle + Math.PI / 2, v));
  }
}

/**
 * return {a: ___, b: ___, c: ___} in "a*x+b*y+c=0"
 * @param {*} angle instanceof the sloopAngle
 * @param {*} trans instanceof any point or vector that the line crossing through.
 */
export function lineEquation(angle, trans) {
  return {
    a: Math.sin(angle),
    b: -Math.cos(angle),
    c: -Math.sin(angle) * trans.x + Math.cos(angle) * trans.y,
    angle: angle,
  };
}

/**
 * return a vector represents
 * @param {*} lineEquation1 instanceof {a: ___, b: ___, c: ___} in "a*x+b*y+c=0"
 * @param {*} lineEquation2 instanceof {a: ___, b: ___, c: ___} in "a*x+b*y+c=0"
 */
export function lineIntersection(le1, le2) {
  const y = -(le1.c / le1.a - le2.c / le2.a) / (le1.b / le1.a - le2.b / le2.a);
  return new Vector((-le1.b * y - le1.c) / le1.a, y);
}

//#endregion

import Vector from './Vector';

export interface LineEquation {
  a: number;
  b: number;
  c: number;
  angle: number;
}

export function distToLine(v: Vector, le: LineEquation): number | undefined {
  if (v) {
    return Math.abs(le.a * v.x + le.b * v.y + le.c) / Math.sqrt(le.a ** 2 + le.b ** 2);
  }
}

export function projectionToLine(v: Vector, le: LineEquation): Vector | undefined {
  if (v && le) {
    return lineIntersection(le, lineEquation(le.angle + Math.PI / 2, v));
  }
}

export function lineEquation(angle: number, trans: { x: number; y: number }): LineEquation {
  return {
    a: Math.sin(angle),
    b: -Math.cos(angle),
    c: -Math.sin(angle) * trans.x + Math.cos(angle) * trans.y,
    angle: angle,
  };
}

export function lineIntersection(le1: LineEquation, le2: LineEquation): Vector {
  const y = -(le1.c / le1.a - le2.c / le2.a) / (le1.b / le1.a - le2.b / le2.a);
  return new Vector((-le1.b * y - le1.c) / le1.a, y);
}

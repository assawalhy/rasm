import * as Core from './Core';
import Vector from './Vector';

export interface AngleOptions {
  type?: 'vectors' | 'lines';
  dir?: 'counterclockwise' | 'clockwise' | '+' | '-';
}

export interface DegreesResult {
  degrees: number;
  minutes: number;
  seconds: number;
}

const Angles = {
  minAngle: (p1: Vector, p2: Vector, options: AngleOptions = {}): number => {
    const type = options.type || 'vectors';
    if (type === 'vectors') {
      const s = p1.dot(p2) / (p1.mag * p2.mag);
      const a = Math.acos(Core.constrain(s, -1, 1));

      return Angles.constrainAngle(a);
    }

    if (type === 'lines') {
      const a = Angles.minAngle(p1, p2);
      return Math.min(a, Math.PI - a);
    }
    return 0;
  },

  maxAngle: (p1: Vector, p2: Vector, options: AngleOptions = {}): number => {
    const type = options.type || 'vectors';
    if (type === 'vectors') {
      const min = Angles.minAngle(p1, p2);
      return Math.max(2 * Math.PI - min, min);
    }

    if (type === 'lines') {
      const a = Angles.minAngle(p1, p2);
      return Math.max(a, Math.PI - a);
    }
    return 0;
  },

  angle: (p1: Vector, p2: Vector, options: AngleOptions = {}): number => {
    const type = options.type || 'vectors';
    const dir = options.dir || 'counterclockwise';

    if (type === 'vectors') {
      let a1 = Angles.minAngle(p1, new Vector(1, 0));
      a1 = p1.y >= 0 ? a1 : -a1;
      let a2 = Angles.minAngle(p2, new Vector(1, 0));
      a2 = p2.y >= 0 ? a2 : -a2;
      const a = dir === 'counterclockwise' || dir === '+' ? a2 - a1 : a1 - a2;

      return Angles.constrainAngle(a);
    }
    if (type === 'lines') {
      const a1 = Angles.angle(p1, p2, { type: 'vectors', dir });
      const a2 = Angles.angle(p1, p2.mult(-1), { type: 'vectors', dir });
      return Math.min(a1, a2);
    }
    return 0;
  },

  constrainAngle: (angle: number, positive = false): number => {
    const sin_ = Math.sin(angle);
    const cos_ = Math.cos(angle);
    const a = Math.asin(Math.abs(sin_));
    if (positive) {
      return sin_ >= 0
        ? cos_ >= 0
          ? a
          : Math.PI - a
        : cos_ >= 0
          ? 2 * Math.PI - a
          : Math.PI + a;
    }

    return sin_ >= 0
      ? cos_ >= 0
        ? a
        : Math.PI - a
      : cos_ >= 0
        ? -a
        : -Math.PI + a;
  },

  snapAngle: (a: number, valuesTOsnapTO?: number[]): number => {
    const margin = Angles.deg(2.5);
    if (!valuesTOsnapTO) {
      const snapTo = [Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2];
      for (let i = 0; i < 4; i++) {
        snapTo.push(Math.PI - snapTo[i]);
        snapTo.push(Math.PI + snapTo[i]);
        snapTo.push(2 * Math.PI - snapTo[i]);
      }
      snapTo.push(0);
      snapTo.push(Math.PI);
      valuesTOsnapTO = snapTo;
    }
    for (const s of valuesTOsnapTO) {
      const a1 = Angles.minAngle(Vector.fromAngle(a), Vector.fromAngle(s));
      if (a1 <= margin) {
        return s;
      }
    }
    return a;
  },

  degAngle: (angle: number): DegreesResult => {
    if (!Core.isNumeric(angle))
      throw new Error(`your angle value (${angle}) is not valid. :"(`);
    let angleNum: number = typeof angle === 'string' ? Number.parseFloat(angle) : (angle as number);
    angleNum = (angleNum * 180) / Math.PI;
    let deg: number;
    let min: [number, number];
    let sec: [number, number];

    const getTerm = (a: number, b: number): [number, number] => {
      let val = Number.parseFloat(`0.${a.toString()}`);
      val *= b;
      const splitted = val.toString().split('.');
      return [Number.parseInt(splitted[0]), Number.parseInt(splitted[1] || '0')];
    };

    if (Math.round(angleNum) !== angleNum) {
      const splitted = angleNum.toString().split('.');
      deg = Number.parseInt(splitted[0]);
      const fractionPart = Number.parseInt(splitted[1] || '0');
      min = getTerm(fractionPart, 60);
      sec = getTerm(min[1], 60);

      if (Math.abs(sec[0] - 60) <= 1) {
        min[0]++;
        sec[0] = 0;
      }
      if (min[0] === 60) {
        deg += 1 * Math.sign(deg);
        min[0] = 0;
      }
      return { degrees: deg, minutes: min[0], seconds: sec[0] };
    }
    return { degrees: angleNum, minutes: 0, seconds: 0 };
  },

  stringDegAngle: (angle: number): string => {
    const deg = Angles.degAngle(angle);
    if (deg.degrees !== 0) {
      if (deg.minutes !== 0) {
        if (deg.seconds !== 0) {
          return `${deg.degrees}° ${deg.minutes}' ${deg.seconds.toFixed(2)}"`;
        }
        return `${deg.degrees}° ${deg.minutes}'`;
      }
      if (deg.seconds !== 0) {
        return `${deg.degrees}° ${deg.seconds.toFixed(2)}"`;
      }
      return `${deg.degrees}°`;
    }
    if (deg.minutes !== 0) {
      if (deg.seconds !== 0) {
        return `${deg.minutes}' ${deg.seconds.toFixed(2)}"`;
      }
      return `${deg.minutes}'`;
    }
    if (deg.seconds !== 0) {
      return `${deg.seconds.toFixed(2)}"`;
    }

    return `${0}°`;
  },

  deg: (a: number, to: 'rad' = 'rad'): number => {
    switch (to) {
      case 'rad':
        return (a * Math.PI) / 180;
    }
  },
  toDeg: (a: number, from: 'rad' = 'rad'): number => {
    switch (from) {
      case 'rad':
        return (a / Math.PI) * 180;
    }
  },
};

export default Angles;

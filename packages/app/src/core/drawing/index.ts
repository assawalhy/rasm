import chroma, { type Color as C } from 'chroma-js';
import { Core } from '@rasm/math';
import Canvas from '../Canvas.js';

export class Pen {
  color: Color;
  weight: number;
  style: string;

  constructor(color: Color, weight = 1, style = 'solid') {
    this.color = color;
    this.weight = weight;
    this.style = style;
  }

  setup(canvasORctx: Canvas | HTMLCanvasElement | CanvasRenderingContext2D) {
    let ctx: CanvasRenderingContext2D;

    if (canvasORctx instanceof Canvas) {
      ctx = canvasORctx.ctx;
    } else if (canvasORctx instanceof HTMLCanvasElement) {
      const context = canvasORctx.getContext('2d');
      if (!context) throw new Error('Could not get 2d context from canvas');
      ctx = context;
    } else {
      ctx = canvasORctx;
    }

    ctx.strokeStyle = this.color.toString();
    ctx.lineWidth = this.weight;
  }
}

export class Color {
  private _c: chroma.Color;

  constructor(...args: [] | [number, number, number] | [number, number, number, number] | [string]) {
    if (args.length === 0) {
      this._c = chroma('black');
    } else if (args.length === 1 && typeof args[0] === 'string') {
      this._c = chroma(args[0]);
    } else if (args.length === 3) {
      this._c = chroma(...args, 'rgb');
    } else if (args.length === 4) {
      this._c = chroma(...(args.slice(0, 3) as [number, number, number]), 'rgb').alpha(args[3] as number);
    } else {
      // fallback
      this._c = chroma('black');
    }
  }

  get r(): number {
    return this._c.get('rgb.r');
  }
  get g(): number {
    return this._c.get('rgb.g');
  }
  get b(): number {
    return this._c.get('rgb.b');
  }
  get a(): number {
    return this._c.alpha();
  }

  set r(v: number) {
    this._c = this._c.set('rgb.r', v);
  }
  set g(v: number) {
    this._c = this._c.set('rgb.g', v);
  }
  set b(v: number) {
    this._c = this._c.set('rgb.b', v);
  }
  set a(v: number) {
    this._c = this._c.alpha(v);
  }

  get brightness(): number {
    return this._c.get('hsl.l');
  }

  get hue(): number {
    return this._c.get('hsl.h');
  }

  get saturation(): number {
    return this._c.get('hsl.s');
  }

  isDark(): boolean {
    return this.brightness <= 0.35;
  }

  toArray(): number[] {
    return this._c.rgba();
  }

  toString(): string {
    return `rgba(${this._c.get("rgb.r")},${this._c.get("rgb.g")},${this._c.get("rgb.b")},${this._c.alpha()})`;
  }

  toCss() {
    return this._c.css();
  }

  setColor(str: string) {
    if (!str) return;
    try {
      this._c = chroma(str);
    } catch (e) {
      console.warn('Invalid color string:', str);
    }
  }
}

export function randomColor(): Color {
  const r = Core.random(255);
  const g = Core.random(255);
  const b = Core.random(255);
  return new Color(r, g, b);
}

export function randomDarkColor(): Color {
  let c: Color;
  do {
    c = randomColor();
  } while (!c.isDark());
  return c;
}

export function randomLightColor(): Color {
  let c: Color;
  do {
    c = randomColor();
  } while (c.isDark());
  return c;
}

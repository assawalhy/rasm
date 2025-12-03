import Canvas from '../Canvas.js';
import { Core } from "~/math";

export class Pen {
  constructor(color, weight = 1, style = 'solid') {
    this.color = color;
    this.weight = weight;
    this.style = style;
  }
  setup(canvasORctx) {
    canvasORctx =
      canvasORctx instanceof Canvas
        ? canvasORctx.ctx
        : canvasORctx instanceof HTMLCanvasElement
          ? canvasORctx.getContext('2d')
          : canvasORctx;
    canvasORctx.strokeStyle = this.color.toString();
    canvasORctx.lineWidth = this.weight;
  }
}

export class Color {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  get brightness() {
    const num = this.r / 255;
    const num2 = this.g / 255;
    const num3 = this.b / 255;
    let num4 = num;
    let num5 = num;
    if (num2 > num4) num4 = num2;
    if (num3 > num4) num4 = num3;
    if (num2 < num5) num5 = num2;
    if (num3 < num5) num5 = num3;
    return (num4 + num5) / 2;
  }

  get hue() {
    if (this.r === this.g && this.g === this.b) return 0;
    const num = this.r / 255;
    const num2 = this.g / 255;
    const num3 = this.b / 255;
    let num7 = 0;
    let num4 = num;
    let num5 = num;
    if (num2 > num4) num4 = num2;
    if (num3 > num4) num4 = num3;
    if (num2 < num5) num5 = num2;
    if (num3 < num5) num5 = num3;
    const num6 = num4 - num5;
    if (num === num4) num7 = (num2 - num3) / num6;
    else if (num2 === num4) num7 = 2 + (num3 - num) / num6;
    else if (num3 === num4) num7 = 4 + (num - num2) / num6;
    num7 *= 60;
    if (num7 < 0) num7 += 360;
    return num7;
  }

  get saturation() {
    const num = this.r / 255;
    const num2 = this.g / 255;
    const num3 = this.b / 255;
    const num7 = 0;
    let num4 = num;
    let num5 = num;
    if (num2 > num4) num4 = num2;
    if (num3 > num4) num4 = num3;
    if (num2 < num5) num5 = num2;
    if (num3 < num5) num5 = num3;
    if (num4 === num5) return num7;
    const num6 = (num4 + num5) / 2;
    if (num6 <= 0.5) return (num4 - num5) / (num4 + num5);
    return (num4 - num5) / (2 - num4 - num5);
  }

  isDark() {
    if (this.brightness > 0.4) {
      return false;
    }
    return true;
  }

  toArray(override = {}) {
    return [
      override.r || override.r === 0 ? override.r : this.r,
      override.g || override.g === 0 ? override.g : this.g,
      override.b || override.b === 0 ? override.b : this.b,
      override.a || override.a === 0 ? override.a : this.a,
    ];
  }

  toString(override = {}) {
    return `rgba(${this.toArray(override).join(', ')})`;
  }
}

/**
 * our color is an object has r g b as properties. {r: num, g: num, b: num}
 */
export const colorPackage = {
  brightness: (color) => {
    const num = color.r / 255;
    const num2 = color.g / 255;
    const num3 = color.b / 255;
    let num4 = num;
    let num5 = num;
    if (num2 > num4) num4 = num2;
    if (num3 > num4) num4 = num3;
    if (num2 < num5) num5 = num2;
    if (num3 < num5) num5 = num3;
    return (num4 + num5) / 2;
  },

  hue: (color) => {
    if (color.r === color.g && color.g === color.b) return 0;
    const num = color.r / 255;
    const num2 = color.g / 255;
    const num3 = color.b / 255;
    let num7 = 0;
    let num4 = num;
    let num5 = num;
    if (num2 > num4) num4 = num2;
    if (num3 > num4) num4 = num3;
    if (num2 < num5) num5 = num2;
    if (num3 < num5) num5 = num3;
    const num6 = num4 - num5;
    if (num === num4) num7 = (num2 - num3) / num6;
    else if (num2 === num4) num7 = 2 + (num3 - num) / num6;
    else if (num3 === num4) num7 = 4 + (num - num2) / num6;
    num7 *= 60;
    if (num7 < 0) num7 += 360;
    return num7;
  },

  saturation: (color) => {
    const num = color.r / 255;
    const num2 = color.g / 255;
    const num3 = color.b / 255;
    const num7 = 0;
    let num4 = num;
    let num5 = num;
    if (num2 > num4) num4 = num2;
    if (num3 > num4) num4 = num3;
    if (num2 < num5) num5 = num2;
    if (num3 < num5) num5 = num3;
    if (num4 === num5) return num7;
    const num6 = (num4 + num5) / 2;
    if (num6 <= 0.5) return (num4 - num5) / (num4 + num5);
    return (num4 - num5) / (2 - num4 - num5);
  },

  isDark: (color) => {
    if (colorPackage.brightness(color) > 0.35) {
      return false;
    }
    return true;
  },

  randomColor: () => {
    return new Color(Core.random(255), Core.random(255), Core.random(255));
  },

  randomDarkColor: () => {
    let c = colorPackage.randomColor();
    do {
      c = colorPackage.randomColor();
    } while (!c.isDark());
    return c;
  },

  randomLightColor: () => {
    let c = colorPackage.randomColor();
    do {
      c = colorPackage.randomColor();
    } while (c.isDark());
    return c;
  }
};


export function measureString(txt) {
  return canvas.elt.getContext('2d').measureText(txt);
}

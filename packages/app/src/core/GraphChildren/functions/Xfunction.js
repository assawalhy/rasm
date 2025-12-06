import { graphSettings, mathToPixel } from '@stores/graphSettingsStore';
import { Pen, colorPackage } from '../../drawing';
import { getJSfunction } from '../../global.js';
import GraphChild from '../GraphChild.js';

export default class Xfunction extends GraphChild {
  constructor(options) {
    const idExists = options.id;
    if (!options.expr) {
      throw new Error(
        "Your options passed to the sketchChild is not valid, it doesn't have 'expr' property, or it is falsy value",
      );
    }
    if (!options.pen) {
      const c = options.sketch.coor.coorSettings.background.isDark()
        ? colorPackage.randomLightColor()
        : colorPackage.randomDarkColor();
      c.a = 155;
      options.pen = new Pen(c, 2);
    }

    super(options, (me) => {
      me.expression = getJSfunction(me.expr, ['x'], true);
      me.path = new Path2D();

      if (idExists) {
        Math[me.id] = me.expression;
      }
    });
  }

  static fromString(expr, sketch) {
    if (str.replace(/==+/, '').indexOf('=') > -1) throw new Error('there is "=" operator!');
    return new Xfunction({ expr, sketch });
  }

  _update(canvas) {
    let p;
    let previousP;
    let midP;
    let continous;
    const path = new Path2D();
    const vp = this.viewport;
    const drawingStep = graphSettings.xSpaceValue / graphSettings.xSpace;

    for (let x = vp.xmin; x <= vp.xmax; x += drawingStep) {
      p = mathToPixel(x, this.expression(x));
      midP = mathToPixel(x - drawingStep / 2, this.expression(x - drawingStep / 2));
      // if valid add new point, unless add the array of point if has more than point
      const valid =
        !isNaN(p.x) &&
        !isNaN(p.y) &&
        Math.abs(p.x) < 100000 &&
        Math.abs(p.y) < 100000 &&
        ((continous &&
          (Math.sign(p.y - midP.y) === Math.sign(midP.y - previousP.y) ||
            Math.abs(p.y - previousP.y) / drawingStep < 20)) ||
          !continous);
      if (!valid) {
        if (continous) {
          continous = false;
        }
      } else {
        if (continous) path.lineTo(p.x, p.y);
        else path.moveTo(p.x, p.y);

        previousP = { x: p.x, y: p.y };
        continous = true;
      }
    }

    this.path = path;
  }

  _draw(canvas /*: import('../../Canvas.js') */) {
    const ctx = canvas.ctx;
    ctx.strokeStyle = this.pen.color.toString();
    ctx.lineWidth = this.pen.weight;
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 1;
    ctx.stroke(this.path);
  }

  _remove() {
    delete Math[this.id];
  }

  toString() {
    return this.expression;
  }
}

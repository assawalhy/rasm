import { Pen, colorPackage } from '../../drawing';
import { getJSfunction } from '../../global.js';
/****************************************************************/
/****************************************************************/
/****************************************************************/
import GraphChild from '../GraphChild.js';

export default class XYfunction extends GraphChild {
  /**
   * gs stands for graphSetting.
   */
  constructor(options) {
    //#region
    let propName;

    propName = 'expr';
    if (!options[propName]) {
      throw new Error(
        `Your options passed to the shetchChild is not valid, it doesn't has ${propName} property, or it is falsy value`,
      );
    }

    if (!options.pen) {
      const c = options.sketch.coor.coorSettings.background.isDark()
        ? colorPackage.randomLightColor()
        : colorPackage.randomDarkColor();
      c.a = 155;
      options.pen = new Pen(c, 2);
    }
    //#endregion

    super(options);
    this.expression = getJSfunction(this.expr, ['x'], true);
  }

  static fromString(expr, sketch) {
    if (str.replace(/==+/, '').indexOf('=') > -1) throw new Error('there is "=" opertor!');
    return new XYfunction({ expr, sketch });
  }

  render(canvas) {
    if (this.renderable) {
      try {
        const ctx = canvas.ctx;
        ctx.strokeStyle = this.pen.color.toString();
        ctx.lineWidth = this.pen.weight;
        let p;
        let previousP;
        let midP;
        let continous;
        ctx.beginPath();
        for (let x = this.gs.viewport.xmin; x <= this.gs.viewport.xmax; x += this.gs.drawingStep) {
          p = this.gs.mathToPixel(x, this.expression(x));
          midP = this.gs.mathToPixel(x - this.gs.drawingStep / 2, this.expression(x - this.gs.drawingStep / 2));
          // if valid add new point, unless add the array of point if has more than point
          const valid =
            !isNaN(p.x) &&
            !isNaN(p.y) &&
            Math.abs(p.x) < 100000 &&
            Math.abs(p.y) < 100000 &&
            ((continous &&
              (Math.sign(p.y - midP.y) === Math.sign(midP.y - previousP.y) ||
                Math.abs(p.y - previousP.y) / this.gs.drawingStep < 20)) ||
              !continous);
          if (!valid) {
            if (continous) {
              ctx.stroke();
              ctx.beginPath();
              continous = false;
            }
          } else {
            if (continous) ctx.lineTo(p.x, p.y);
            else ctx.moveTo(p.x, p.y);

            previousP = { x: p.x, y: p.y };
            continous = true;
          }
        }

        ctx.stroke();
      } catch (e) {
        this.error(e);
      }
    }
    if (this.handlers.onupdate) {
      this.handlers.onupdate(...handlerArgs);
    }
  }

  toString() {
    return this.expression;
  }
}

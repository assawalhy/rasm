import { graphSettings, xToPixel, yToPixel, mathToPixel, getIVector, getJVector } from '@stores/graphSettingsStore';
import { Color, Pen } from './drawing/index.js';
import { Vector } from '@rasm/math';

/**
 * Coordinates class - draws grid, axes, and labels
 * Uses graphSettingsStore for transformations
 */
export default class Coordinates {
  constructor(sketch, width, height, coorSettings) {
    this.sketch = sketch;
    this.width = width;
    this.height = height;

    const defaultCoorSettings = {
      type: 'default',
      xUnit: '',
      yUnit: '',

      background: new Color(255, 255, 255, 255),
      font: 'Georgia',

      drawDecimalLines: true,
      drawMainLines: true,
      drawAxisesLines: true,
      drawPolarCircles: false,
      drawPolarLines: false,
      drawPolarAngles: false,
      drawNumbers: true,

      decimalLinesSpace: 5,
      polarCirclesSpace: 5,
      polarLinesAnglesSpace: 6,

      penDecimalLines: null,
      penMainLines: null,
      penXaxis: null,
      penYaxis: null,
      penPolarCircles: null,
      penPolarLines: null,

      autoRefiningOnZoomimg: true,
    };

    Object.assign(defaultCoorSettings, {
      color: defaultCoorSettings.background.isDark() ? new Color(200, 200, 200, 255) : new Color(50, 50, 50, 1),
      antiBackground: defaultCoorSettings.background.isDark()
        ? new Color(200, 200, 200, 255)
        : new Color(50, 50, 50, 1),
      drawDecimalLines: !defaultCoorSettings.background.isDark(),
      penDecimalLines: new Pen(
        defaultCoorSettings.background.isDark() ? new Color(200, 200, 200, 30 / 255) : new Color(50, 50, 50, 30 / 255),
        1,
      ),
      penMainLines: new Pen(
        defaultCoorSettings.background.isDark()
          ? new Color(200, 200, 200, 100 / 255)
          : new Color(50, 50, 50, 100 / 255),
        1,
      ),
      penXaxis: new Pen(
        defaultCoorSettings.background.isDark() ? new Color(255, 255, 255, 150 / 255) : new Color(0, 0, 0, 150 / 255),
        2,
      ),
      penYaxis: new Pen(
        defaultCoorSettings.background.isDark() ? new Color(255, 255, 255, 150 / 255) : new Color(0, 0, 0, 150 / 255),
        2,
      ),
      penPolarCircles: new Pen(
        defaultCoorSettings.background.isDark() ? new Color(200, 200, 200, 100 / 255) : new Color(50, 50, 50, 50 / 255),
        1,
      ),
      penPolarLines: new Pen(
        defaultCoorSettings.background.isDark() ? new Color(200, 200, 200, 100 / 255) : new Color(50, 50, 50, 50 / 255),
        1,
      ),
    });
    Object.assign(defaultCoorSettings, {
      fillColor: defaultCoorSettings.color.toString(),
      fillColorDim: defaultCoorSettings.color.toString({ a: 0.5 }),
    });
    if (coorSettings) {
      this.coorSettings = {};
      Object.assign(this.coorSettings, defaultCoorSettings);
      Object.assign(this.coorSettings, coorSettings);
    } else {
      this.coorSettings = defaultCoorSettings;
    }
  }

  draw(canvas) {
    switch (this.coorSettings.type) {
      case 'default':
        this.custom(canvas);
        break;
      case 'rad':
        this.radian(canvas);
        break;
    }
  }

  custom(canvas) {
    // Get settings from store
    const vp = graphSettings.viewport;
    const xSpaceValue = graphSettings.xSpaceValue;
    const ySpaceValue = graphSettings.ySpaceValue;

    let start_x;
    let start_y;
    let end_x;
    let end_y;

    start_x = Math.floor(vp.xmin / xSpaceValue) * xSpaceValue;
    end_x = Math.ceil(vp.xmax / xSpaceValue) * xSpaceValue;
    start_y = Math.floor(vp.ymin / ySpaceValue) * ySpaceValue;
    end_y = Math.ceil(vp.ymax / ySpaceValue) * ySpaceValue;

    if (this.coorSettings.drawDecimalLines) {
      canvas.ctx.beginPath();
      this.coorSettings.penDecimalLines.setup(canvas);
      // x
      for (let i = start_x; i <= end_x; i += xSpaceValue / this.coorSettings.decimalLinesSpace)
        canvas.line(xToPixel(i, start_y), yToPixel(i, start_y), xToPixel(i, end_y), yToPixel(i, end_y));
      // y
      for (let i = start_y; i <= end_y; i += ySpaceValue / this.coorSettings.decimalLinesSpace)
        canvas.line(xToPixel(start_x, i), yToPixel(start_x, i), xToPixel(end_x, i), yToPixel(end_x, i));
      canvas.ctx.stroke();
    }

    if (this.coorSettings.drawMainLines) {
      canvas.ctx.beginPath();
      this.coorSettings.penMainLines.setup(canvas);
      // x
      for (let i = start_x; i <= end_x; i += xSpaceValue)
        canvas.line(xToPixel(i, start_y), yToPixel(i, start_y), xToPixel(i, end_y), yToPixel(i, end_y));
      // y
      for (let i = start_y; i <= end_y; i += ySpaceValue)
        canvas.line(xToPixel(start_x, i), yToPixel(start_x, i), xToPixel(end_x, i), yToPixel(end_x, i));
      canvas.ctx.stroke();
    }

    if (this.coorSettings.drawAxisesLines) {
      canvas.ctx.beginPath();
      // Check for highlight
      if (this.sketch.activeAxis === 'x' || this.sketch.activeAxis === 'xy') {
        const highlightPen = new Pen(new Color(255, 0, 0, 155), 2);
        highlightPen.setup(canvas);
      } else {
        this.coorSettings.penXaxis.setup(canvas);
      }
      canvas.line(xToPixel(start_x, 0), yToPixel(start_x, 0), xToPixel(end_x, 0), yToPixel(end_x, 0));
      canvas.ctx.stroke();

      canvas.ctx.beginPath();
      if (this.sketch.activeAxis === 'y' || this.sketch.activeAxis === 'xy') {
        const highlightPen = new Pen(new Color(255, 0, 0, 155), 2);
        highlightPen.setup(canvas);
      } else {
        this.coorSettings.penYaxis.setup(canvas);
      }
      canvas.line(xToPixel(0, start_y), yToPixel(0, start_y), xToPixel(0, end_y), yToPixel(0, end_y));
      canvas.ctx.stroke();
    }

    // numbers and labels
    /////////////////////////

    if (this.coorSettings.drawNumbers) {
      start_x = Math.floor(start_x / xSpaceValue);
      end_x = Math.ceil(end_x / xSpaceValue);
      start_y = Math.floor(start_y / ySpaceValue);
      end_y = Math.ceil(end_y / ySpaceValue);

      let y;
      let x;
      let num;
      canvas.ctx.fillStyle = this.coorSettings.fillColor;
      canvas.ctx.strokeStyle = this.coorSettings.background.toString();
      canvas.ctx.lineWidth = 3;
      canvas.ctx.textAlign = 'left';
      canvas.ctx.textBaseline = 'top';
      canvas.setFont({ size: 15 }); /// setting the label style.

      let xDirection;
      let yDirection;
      if (Math.abs(Math.tan(graphSettings.yAngle)) > Math.abs(Math.tan(graphSettings.xAngle))) {
        // && Math.tan(Math.abs(trans._xAngle - trans._yAngle)) >= 1
        // dealing horizetally when setting x labels vetically.
        xDirection = 'v';
        yDirection = 'h';
      } else {
        xDirection = 'h';
        yDirection = 'v';
      }

      // label position x
      for (let i = start_x; i <= end_x; i += 1) {
        x = i * xSpaceValue;
        num =
          Math.abs(x) < 0.001 || Math.abs(x) >= 999999
            ? x.toExponential(3).replace(/\.?0+e\+?/, '×10^')
            : x.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
        if (x !== 0) {
          num += this.coorSettings.xUnit;
          const p = this.__getLabelPos(canvas, mathToPixel(x, 0), num, xDirection, getJVector());
          canvas.ctx.strokeText(num, p.x, p.y);
          canvas.ctx.fillText(num, p.x, p.y);
        }
      }
      // label position y
      for (let i = start_y; i <= end_y; i += 1) {
        y = i * ySpaceValue;
        num =
          Math.abs(y) < 0.001 || Math.abs(y) >= 999999
            ? y.toExponential(3).replace(/\.?0+e\+?/, '×10^')
            : y.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
        if (y !== 0) {
          num += this.coorSettings.yUnit;
          const p = this.__getLabelPos(canvas, mathToPixel(0, y), num, yDirection, getIVector());
          canvas.ctx.strokeText(num, p.x, p.y);
          canvas.ctx.fillText(num, p.x, p.y);
        }
      }
    }
  }

  radian(canvas) {
    throw new Error('radian coordinates not implemented yet');
  }

  /**
   *
   * @param {Vector} pos the real position for the label on either of the two axes
   * @param {string} number as string to measure its size.
   * @param {string} direction which is either 'h' or 'v', so the code will check if the label is out side the horizental view 'h', or the vertical view 'v';
   */
  __getLabelPos(canvas, pos, number, direction, unitVec) {
    const size = canvas.measureString(number);
    size.height = 10;
    pos = new Vector(pos.x + 4, pos.y + 4);

    if (direction === 'h') {
      const bounds = [10, graphSettings.width - size.width - 10];
      if (pos.x < bounds[0]) {
        const n = (bounds[0] - pos.x) / unitVec.x;
        return pos.add(unitVec.mult(n));
      }
      if (pos.x > bounds[1]) {
        const n = (bounds[1] - pos.x) / unitVec.x;
        return pos.add(unitVec.mult(n));
      }
      return pos;
    }

    /// direction is 'v'
    const bounds = [10, graphSettings.height - size.height - 10];
    if (pos.y < bounds[0]) {
      const n = (bounds[0] - pos.y) / unitVec.y;
      return pos.add(unitVec.mult(n));
    }
    if (pos.y > bounds[1]) {
      const n = (bounds[1] - pos.y) / unitVec.y;
      return pos.add(unitVec.mult(n));
    }
    return pos;
  }
}

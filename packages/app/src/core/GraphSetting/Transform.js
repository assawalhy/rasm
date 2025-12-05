import { Angles, Core, Vector } from '@rasm/math';

export default class {
  constructor(gs) {
    this.gs = gs;
    this.coorManager = gs.coorManager;
    this.handlers = {};

    this.angleMargin = Angles.deg(20);
    this.zoomLimits = [80, 180];
    this.zoomLimits[1] =
      (this.zoomLimits[1] * 2) / 5 < this.zoomLimits[0] ? (this.zoomLimits[0] * 5) / 2 + 1 : this.zoomLimits[0];
    this.zoomRatio = 1.1;

    this.invokeOnchange = true;
    this.reset();
  }

  /**
   * @returns the i vector of the cartesian coordinates relative to (with respect to) the pixel coordinates
   */
  get iVector() {
    return Vector.fromAngle(-this.xAngle).mult(this.xScale);
  }
  /**
   * @returns the j vector of the cartesian coordinates relative to (with respect to) the pixel coordinates
   */
  get jVector() {
    return Vector.fromAngle(-this.yAngle).mult(this.yScale);
  }

  getTransform() {
    const i = this.iVector;
    const j = this.jVector;
    const c = this.center;
    return { a: i.x, b: i.y, c: j.x, d: j.y, e: c.x, f: c.y };
  }

  //#region transformation's origin

  get transformOrigin() {
    return this._transformOrigin;
  }

  set transformOrigin(pxVector) {
    if (pxVector && pxVector instanceof Vector) {
      this._transformOrigin = {
        pxVector: pxVector,
      };
      const coor = this.coorManager.pxTOcoor(pxVector.x, pxVector.y);
      this._transformOrigin.coorVector = new Vector(coor.x, coor.y);
    } else {
      this._transformOrigin = undefined;
    }
  }

  //#endregion

  //#region {rotation, Angles}

  get xAngle() {
    return this._xAngle;
  }
  set xAngle(v) {
    let a = Angles.constrainAngle(v);
    if (Angles.minAngle(Vector.fromAngle(a), Vector.fromAngle(this._yAngle), { type: 'lines' }) < this.angleMargin) {
      let b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(this._yAngle), { dir: 'clockwise' });
      if (b < this.angleMargin && b > 0) {
        a = Angles.constrainAngle(this._yAngle + this.angleMargin);
      } else {
        b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(this._yAngle));
        if (b < this.angleMargin && b > 0) {
          a = Angles.constrainAngle(this._yAngle - this.angleMargin);
        } else {
          b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(this._yAngle).mult(-1), { dir: 'clockwise' });
          if (b < this.angleMargin && b > 0) {
            a = Angles.constrainAngle(this._yAngle + Math.PI + this.angleMargin);
          } else {
            b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(this._yAngle).mult(-1));
            if (b < this.angleMargin && b > 0) {
              a = Angles.constrainAngle(this._yAngle + Math.PI - this.angleMargin);
            }
          }
        }
      }
    }
    this._xAngle = a;
  }

  get yAngle() {
    return this._yAngle;
  }
  set yAngle(v) {
    let a = Angles.constrainAngle(v);
    if (Angles.minAngle(Vector.fromAngle(a), Vector.fromAngle(this._xAngle), { type: 'lines' }) < this.angleMargin) {
      let b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(this._xAngle), { dir: 'clockwise' });
      if (b < this.angleMargin && b > 0) {
        a = Angles.constrainAngle(this._xAngle + this.angleMargin);
      } else {
        b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(this._xAngle));
        if (b < this.angleMargin && b > 0) {
          a = Angles.constrainAngle(this._xAngle - this.angleMargin);
        } else {
          b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(this._xAngle).mult(-1), { dir: 'clockwise' });
          if (b < this.angleMargin && b > 0) {
            a = Angles.constrainAngle(this._xAngle + Math.PI + this.angleMargin);
          } else {
            b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(this._xAngle).mult(-1));
            if (b < this.angleMargin && b > 0) {
              a = Angles.constrainAngle(this._xAngle + Math.PI - this.angleMargin);
            }
          }
        }
      }
    }
    this._yAngle = a;
  }

  /**
   * @param {*} type, is 'deg' or 'rad'
   */
  rotate(a, type = 'rad') {
    if (!isNaN(a)) {
      if (type === 'deg') {
        a = (a / 180) * Math.PI;
      }
      const i = this.invokeOnchange;
      this.invokeOnchange = false;
      this.xAngle += a;
      this.yAngle += a;
      this.invokeOnchange = i;
      this.onchange();
    }
  }

  /**
   * @param {*} type, is 'deg' or 'rad'
   */
  rotateX(a, type = 'rad') {
    if (!isNaN(a)) {
      if (type === 'deg') {
        a = (a / 180) * Math.PI;
      }
      const i = this.invokeOnchange;
      this.invokeOnchange = false;
      this.xAngle += a;
      this.invokeOnchange = i;
      this.onchange();
    }
  }

  /**
   * @param {*} type, is 'deg' or 'rad'
   */
  rotateY(a, type = 'rad') {
    if (!isNaN(a)) {
      this.invokeOnchange = false;
      if (type === 'deg') {
        a = (a / 180) * Math.PI;
      }
      const i = this.invokeOnchange;
      this.invokeOnchange = false;
      this.yAngle += a;
      this.invokeOnchange = i;
      this.onchange();
    }
  }

  //#endregion

  //#region translate

  get center() {
    return this._center;
  }

  set center(vec) {
    this._center = vec;
    this.onchange(this.invokeOnchange, false);
  }

  translate(value) {
    this.center = new Vector(this._center.x + value.x, this._center.y + value.y);
  }

  //#endregion

  //#region zoom

  zoomIn(centerOfZoom) {
    centerOfZoom = centerOfZoom || new Vector(this.gs.width / 2, this.gs.height / 2);
    this.transformOrigin = centerOfZoom;

    const a = this.invokeOnchange;
    this.invokeOnchange = false;
    this.xZoomIn();
    this.yZoomIn();
    this.invokeOnchange = a;
    this.onchange();
  }

  zoomOut(centerOfZoom) {
    centerOfZoom = centerOfZoom || new Vector(this.gs.width / 2, this.gs.height / 2);
    this.transformOrigin = centerOfZoom;

    const a = this.invokeOnchange;
    this.invokeOnchange = false;
    this.xZoomOut();
    this.yZoomOut();
    this.invokeOnchange = a;
    this.onchange();
  }

  xZoomIn() {
    // #region X
    if (this.xSpace <= this.zoomLimits[1]) this.xSpace *= this.zoomRatio;

    this.reformXspace();
    this.onchange();
    //#endregion
  }

  xZoomOut() {
    // #region X
    if (this.xSpace >= this.zoomLimits[0]) this.xSpace /= this.zoomRatio;

    this.reformXspace();
    this.onchange();
    //#endregion
  }

  yZoomIn() {
    // #region Y
    if (this.ySpace <= this.zoomLimits[1]) this.ySpace *= this.zoomRatio;

    this.reformYspace();
    this.onchange();
    //#endregion
  }

  yZoomOut() {
    // #region Y
    if (this.ySpace >= this.zoomLimits[0]) this.ySpace /= this.zoomRatio;

    this.reformYspace();
    this.onchange();
    //#endregion
  }

  //#endregion

  //#region viewport managment

  /**
   * setting new viewport form the cartesian coordinates.
   * @param {Object} viewport
   * an object has: 1. xmin, xmax, ymin, ymax representing the edges of the cartesian coordinates not the pixels in the canvas
   * @param {Object} keepRatio
   */
  setViewport(viewport, keepRatio) {
    //#region precalculations
    // the top left corner
    viewport.xmin = viewport.xmin === 0 ? 0 : viewport.xmin || this.gs.viewport.xmin;
    viewport.xmax = viewport.xmax === 0 ? 0 : viewport.xmax || this.gs.viewport.xmax;
    viewport.ymin = viewport.ymin === 0 ? 0 : viewport.ymin || this.gs.viewport.ymin;
    viewport.ymax = viewport.ymax === 0 ? 0 : viewport.ymax || this.gs.viewport.ymax;
    const a = this.invokeOnchange;
    this.invokeOnchange = false;
    const p = this.coorManager.pxTOcoor(this.gs.width / 2, this.gs.height / 2);

    //#endregion

    //#region maincalculations
    const xs = this.xSpace;
    const ys = this.ySpace;

    this.xSpace = this.xSpace / ((viewport.xmax - viewport.xmin) / (this.gs.viewport.xmax - this.gs.viewport.xmin));
    if (keepRatio) {
      this.ySpace *= this.xSpace / xs;
    } else {
      this.ySpace = this.ySpace / ((viewport.ymax - viewport.ymin) / (this.gs.viewport.ymax - this.gs.viewport.ymin));
    }

    if (
      this.ySpace <= 0 ||
      this.xSpace <= 0 ||
      isNaN(this.xSpace) ||
      !Number.isFinite(this.xSpace) ||
      isNaN(this.ySpace) ||
      !Number.isFinite(this.ySpace)
    ) {
      this.xSpace = xs;
      this.ySpace = ys;
    }

    this.reformXspace();
    this.reformYspace();

    //#endregion

    //#region aftercalulations

    this.onchange(true);
    let tfCorner = this.coorManager.coorTOpx(viewport.xmin, viewport.ymax);
    tfCorner = new Vector(tfCorner.x, tfCorner.y);
    /// translation::: put the top left corner as pixels after transformations on top of the one before transformation
    this.translate(tfCorner.mult(-1));
    this.onchange(true);
    if (keepRatio) {
      const p_ = this.coorManager.coorTOpx(p.x, (viewport.ymax + viewport.ymin) / 2);
      this.translate(new Vector(0, this.gs.height / 2 - p_.y));
    }
    this.onchange();
    this.invokeOnchange = a;
    //#endregion
  }

  getViewport(pxViewport) {
    pxViewport.xmin = pxViewport.xmin || 0;
    pxViewport.xmax = pxViewport.xmax || this.gs.width;
    pxViewport.ymin = pxViewport.ymin || 0;
    pxViewport.ymax = pxViewport.ymax || this.gs.height;

    const xStart = this.coorManager.xTOcoor(
      pxViewport.xmin,
      Math.tan(this.yAngle) > 0 ? pxViewport.ymin : pxViewport.ymax,
    );
    const xEnd = this.coorManager.xTOcoor(
      pxViewport.xmax,
      Math.tan(this.yAngle) <= 0 ? pxViewport.ymin : pxViewport.ymax,
    );
    const yStart = this.coorManager.yTOcoor(
      Math.tan(this.xAngle) > 0 ? pxViewport.xmax : pxViewport.xmin,
      pxViewport.ymax,
    );
    const yEnd = this.coorManager.yTOcoor(
      Math.tan(this.xAngle) <= 0 ? pxViewport.xmax : pxViewport.xmin,
      pxViewport.ymin,
    );

    return {
      xmin: xEnd < xStart ? xEnd : xStart,
      xmax: xEnd > xStart ? xEnd : xStart,
      ymin: yEnd < yStart ? yEnd : yStart,
      ymax: yEnd > yStart ? yEnd : yStart,
    };
  }

  //#endregion

  //#region general

  reformXspace() {
    let done = false;
    while (this.xSpace > this.zoomLimits[1]) {
      if (this.xZoomingState === 5) {
        this.xZoomingState = 2;
        const ratio = 2 / 5;
        this.xSpaceValue = this.xSpaceValue * ratio;
        this.xSpace = this.xSpace * ratio;
      } else if (this.xZoomingState === 2) {
        this.xZoomingState = 1;
        const ratio = 1 / 2;
        this.xSpaceValue = this.xSpaceValue * ratio;
        this.xSpace = this.xSpace * ratio;
      } else if (this.xZoomingState === 1) {
        this.xZoomingState = 5;
        const ratio = 0.5 / 1;
        this.xSpaceValue = this.xSpaceValue * ratio;
        this.xSpace = this.xSpace * ratio;
      }
      done = true;
    }
    if (done) return;
    while (this.xSpace < this.zoomLimits[0]) {
      if (this.xZoomingState === 1) {
        this.xZoomingState = 2;
        const ratio = 2 / 1;
        this.xSpaceValue = this.xSpaceValue * ratio;
        this.xSpace = this.xSpace * ratio;
      } else if (this.xZoomingState === 2) {
        this.xZoomingState = 5;
        const ratio = 5 / 2;
        this.xSpaceValue = this.xSpaceValue * ratio;
        this.xSpace = this.xSpace * ratio;
      } else if (this.xZoomingState === 5) {
        this.xZoomingState = 1;
        const ratio = 10 / 5;
        this.xSpaceValue = this.xSpaceValue * ratio;
        this.xSpace = this.xSpace * ratio;
      }
    }
  }
  reformYspace() {
    let done = false;
    while (this.ySpace > this.zoomLimits[1]) {
      if (this.yZoomingState === 5) {
        this.yZoomingState = 2;
        const ratio = 2 / 5;
        this.ySpaceValue = this.ySpaceValue * ratio;
        this.ySpace = this.ySpace * ratio;
      } else if (this.yZoomingState === 2) {
        this.yZoomingState = 1;
        const ratio = 1 / 2;
        this.ySpaceValue = this.ySpaceValue * ratio;
        this.ySpace = this.ySpace * ratio;
      } else if (this.yZoomingState === 1) {
        this.yZoomingState = 5;
        const ratio = 0.5 / 1;
        this.ySpaceValue = this.ySpaceValue * ratio;
        this.ySpace = this.ySpace * ratio;
      }
      done = true;
    }
    if (done) return;
    while (this.ySpace < this.zoomLimits[0]) {
      if (this.yZoomingState === 1) {
        this.yZoomingState = 2;
        const ratio = 2 / 1;
        this.ySpaceValue = this.ySpaceValue * ratio;
        this.ySpace = this.ySpace * ratio;
      } else if (this.yZoomingState === 2) {
        this.yZoomingState = 5;
        const ratio = 5 / 2;
        this.ySpaceValue = this.ySpaceValue * ratio;
        this.ySpace = this.ySpace * ratio;
      } else if (this.yZoomingState === 5) {
        this.yZoomingState = 1;
        const ratio = 10 / 5;
        this.ySpaceValue = this.ySpaceValue * ratio;
        this.ySpace = this.ySpace * ratio;
      }
    }
  }

  reset() {
    this.transformOrigin = undefined;

    this.xSpace = 120;
    this.xSpaceValue = 2;
    this.xSpaceModifier = 1;
    this.xZoomingState = 2;

    this.ySpace = 120;
    this.ySpaceValue = 2;
    this.ySpaceModifier = 1;
    this.yZoomingState = 2;

    this._xAngle = 0;
    this._yAngle = Math.PI / 2;

    this._center = new Vector(this.gs.width / 2, this.gs.height / 2);

    this.onchange();
  }

  assign(target, src) {
    // target._transformOrigin = src._transformOrigin;

    target.xSpace = src.xSpace;
    target.xSpaceValue = src.xSpaceValue;
    target.xSpaceModifier = src.xSpaceModifier;
    target.xZoomingState = src.xZoomingState;

    target.ySpace = src.ySpace;
    target.ySpaceValue = src.ySpaceValue;
    target.ySpaceModifier = src.ySpaceModifier;
    target.yZoomingState = src.yZoomingState;

    target._xAngle = src._xAngle;
    target._yAngle = src._yAngle;

    target._center = src._center;
  }

  onchange(change = this.invokeOnchange, transToOrigin = true) {
    /// updating
    if (change) {
      const ysm = this.xSpaceModifier + Math.abs(Math.cos(this.xAngle - this.yAngle));
      const xsm = this.ySpaceModifier + Math.abs(Math.cos(this.xAngle - this.yAngle));
      this.xScale = (this.xSpace * ysm) / this.xSpaceValue;
      this.yScale = (this.ySpace * xsm) / this.ySpaceValue;

      let invalid =
        !Core.isNumeric(this.xScale) ||
        !Core.isNumeric(this.yScale) ||
        !Core.isNumeric(this.center.x) ||
        !Core.isNumeric(this.center.y) ||
        (this.transformOrigin &&
          transToOrigin &&
          (!Core.isNumeric(this.transformOrigin.coorVector.x) ||
            !Core.isNumeric(this.transformOrigin.coorVector.y) ||
            !Core.isNumeric(this.transformOrigin.pxVector.x) ||
            !Core.isNumeric(this.transformOrigin.pxVector.y)));

      if (invalid) {
        const a = this.invokeOnchange;
        this.invokeOnchange = false;
        try {
          this.assign(this, this.lastVersion.transform);
        } catch (e) {
          this.reset();
        }
        this.invokeOnchange = a;
        this.onchange(true);
        return;
      }

      this.coorManager.transform = this.getTransform();

      const vp = this.getViewport({
        xmin: 0,
        xmax: this.gs.width,
        ymin: 0,
        ymax: this.gs.height,
      });

      vp.width = vp.xmax - vp.xmin;
      vp.height = vp.ymax - vp.ymin;
      this.gs.viewport = vp;

      this.gs.drawingStep = (this.gs.viewport.xmax - this.gs.viewport.xmin) / 10000;

      invalid =
        !Core.isNumeric(this.gs.viewport.xmin) ||
        !Core.isNumeric(this.gs.viewport.xmax) ||
        !Core.isNumeric(this.gs.viewport.ymin) ||
        !Core.isNumeric(this.gs.viewport.ymax) ||
        !Core.isNumeric(this.gs.drawingStep) ||
        this.gs.viewport.xmax - this.gs.viewport.xmin > 10 ** 12 ||
        this.gs.viewport.ymax - this.gs.viewport.ymin > 10 ** 12 ||
        this.gs.viewport.xmax - this.gs.viewport.xmin < 10 ** -12 ||
        this.gs.viewport.ymax - this.gs.viewport.ymin < 10 ** -12 ||
        this.gs.viewport.xmin + this.gs.drawingStep / 2 <= this.gs.viewport.xmin ||
        this.gs.viewport.xmax - this.gs.drawingStep / 2 >= this.gs.viewport.xmax;

      if (invalid && this.lastVersion) {
        const a = this.invokeOnchange;
        this.invokeOnchange = false;
        try {
          this.assign(this, this.lastVersion.transform);
        } catch (e) {
          this.reset();
        }
        this.invokeOnchange = a;
        this.onchange(true);
        return;
      }
      if (this.transformOrigin && transToOrigin) {
        const a = this.invokeOnchange;
        this.invokeOnchange = false;
        const p = this.coorManager.coorTOpx(...this.transformOrigin.coorVector.toArray());
        this.translate(this.transformOrigin.pxVector.subtract(p));
        this.onchange(true, false);
        this.invokeOnchange = a;
        return;
      }

      if (this.handlers.onchange) {
        this.handlers.onchange();
      }
      const trans = {};
      this.assign(trans, this);
      this.lastVersion = {
        transform: trans,
      };
    }
  }

  //#endregion
}

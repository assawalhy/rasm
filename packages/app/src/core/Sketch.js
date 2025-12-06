import { CustomParsers } from '@rasm/magical-parser';
import Canvas from './Canvas.js';
import Coordinates from './Coordinates.js';
import { Empty, EvalExpr, Func, Point, Slider, Variable, Xfunction } from './GraphChildren/index.js';

/**
 * Sketch class - manages graph canvas and children
 * Now uses graphSettingsStore for transformations
 */
export default class Sketch {
  constructor(canvas, childrenCanvas) {
    this.canvas = new Canvas({ canvas });
    this.childrenCanvas = new Canvas({ canvas: childrenCanvas });
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.coor = new Coordinates(this, this.width, this.height);
    this.children = new Map();
    this.childrenCanvas.ctx.miterLimit = 1;
    this.scriptParser = new CustomParsers.Math();
    this.activeAxis = null;
  }

  childFromScript = (script, propsTOset = {}) => {
    const parsedString = this.getChildParser.parse(script.replace(/\^/g, '**'));
    return childFromParsed(parsedString, propsTOset);
  };

  childFromParsed(parsedString, propsTOset = {}) {
    propsTOset.sketch = this;
    if (parsedString.type === '') {
      return new Empty(propsTOset);
    }
    if (parsedString.name === '=') {
      const left = parsedString.args[0];
      const right = parsedString.args[1];

      if (left.check({ type: 'variable', name: 'y' }) && !right.contains({ type: 'variable', name: 'y' })) {
        return new Xfunction(Object.assign(propsTOset, { expr: right }));
      }

      //such : area( h , b , theta ) = 0.5 * h * b * sin( theta )
      //such : g(a) = a^2
      if (left.check({ type: 'functionCalling' })) {
        // such : f(x) = x^2
        if (
          left.args.length === 1 &&
          left.args[0].check({ type: 'variable', name: 'x' }) &&
          !right.contains({ type: 'variable', name: 'y' })
        ) {
          return new Xfunction({ sketch: this, expr: right, id: left.name });
        }

        //such : area( h , b , theta) = 0.5 * h * b * sin( theta )

        const params = [];
        let skip;
        if (left.args[0].check({ type: 'separator', name: ',' })) {
          for (const param of left.args[0].args) {
            if (param.type === 'variable') {
              params.push(param.name);
            } else {
              skip = true;
            }
          }
        } else {
          if (left.args[0].type !== 'variable') skip = true;
          if (!skip) params.push(left.args[0].name);
        }
        if (!skip) {
          return new Func(Object.assign(propsTOset, { id: left.name, params, expr: right }));
        }
      }

      //such : a = 2
      else if (left.type === 'variable' && right.type === 'number') {
        return new Slider(Object.assign(propsTOset, { id: left.name, value: right.value }));
      }
      //such : a = -2
      else if (
        left.type === 'variable' &&
        right.check({ type: 'prefixOperator', name: '-' }) &&
        right.args[0].type === 'number'
      ) {
        return new Slider(Object.assign(propsTOset, { id: left.name, value: -right.args[0].value }));
      }
      //such : a = 2b+c
      else if (left.type === 'variable') {
        return new Variable(Object.assign(propsTOset, { id: left.name, value: right }));
      }
    }

    /// to add function like : x^2
    else if (parsedString.contains({ type: 'variable', name: 'x' })) {
      return new Xfunction(Object.assign(propsTOset, { expr: parsedString }));
    }

    /// to add a point like (1, 2)
    else if (
      parsedString.check({ type: 'block', name: '()' }) &&
      parsedString.args.length === 1 &&
      parsedString.args[0].check({ type: 'separator', name: ',', length: 2 })
    ) {
      /// it is a point
      return new Point(
        Object.assign({ x: parsedString.args[0].args[0], y: parsedString.args[0].args[1] }, propsTOset),
      );
    }

    return new EvalExpr(Object.assign(propsTOset, { expr: parsedString, drawable: false }));
  }

  getChildById = (id) => {
    return this.children.get(id);
  };

  update = ({ redraw = true, redrawCoors = true } = {}) => {
    if (this.status === 'updating' || this.status === 're-updating') {
      this.status = 're-update';
    } else {
      this.status = 'updating';
      for (const child of this.children.values()) {
        if (child) {
          child.update(this.childrenCanvas);
        }
      }
      if (redraw) {
        this.draw({ redrawCoors });
      }
      if (this.status === 're-update') {
        this.status = 'ready';
        this.update({ redraw, redrawCoors });
      } else {
        this.status = 'ready';
      }
    }
  };

  draw = ({ redrawCoors = true } = {}) => {
    if (redrawCoors) {
      this.canvas.clear();
      this.coor.draw(this.canvas);
    }

    this.childrenCanvas.clear();

    for (const child of this.children.values()) {
      if (child) {
        child.draw(this.childrenCanvas);
      }
    }
  };
}

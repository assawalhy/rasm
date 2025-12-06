import { graphSettings, mathToPixel } from '@stores/graphSettingsStore';
import { generateName } from '../global.js';

/**
 * Base class for all graph children (functions, points, sliders, etc.)
 * Uses graphSettingsStore for viewport and coordinate transformations
 */
export default class GraphChild {
  /**
   * @param {*} options
   * include these properties:
   * 1. sketch
   * 2. id
   * 3. [pen] ::: for drawable children that will be drawn in the canvas
   * 4. [handlers] ::: {
   *      onchange ::: for the slider,
   *      onupdate :: updating the drawing object that will be using in the rendering process,
   *      ondrender::: rendering the graphics object coming from the latest finished updating process,
   *      onerror,
   *      onremove
   *  }
   * 5. [renderable] ::: boolean that indicate whether or not you want to make this graphChild updated and rendered
   */
  constructor(options, callback) {
    this.handlers = options.handlers || {};
    this.renderable = Object.prototype.hasOwnProperty.call(options, 'renderable') ? options.renderable : true;

    if (!options.sketch) {
      throw new Error(
        "Your options passed to the sketchChild is not valid, it doesn't have 'sketch' property, or it is falsy value",
      );
    }

    this.sketch = options.sketch;

    const optionsClone = { ...options };
    // biome-ignore lint/performance/noDelete: <explanation>
    delete optionsClone.sketch;
    // biome-ignore lint/performance/noDelete: <explanation>
    delete optionsClone.handlers;
    // biome-ignore lint/performance/noDelete: <explanation>
    delete optionsClone.renderable;
    optionsClone.id = optionsClone.id || generateName();
    Object.assign(this, optionsClone);

    if (callback) callback(this);

    this.sketch.children.set(this.id, this);
  }

  /**
   * Get viewport from store
   */
  get viewport() {
    return graphSettings.viewport;
  }

  /**
   * Convert math coordinates to pixel coordinates
   */
  mathToPixel(x, y) {
    return mathToPixel(x, y);
  }

  get id() {
    return this._id;
  }

  set id(value) {
    // Simple ID validation (no duplicates in sketch children)
    if (this.sketch.children.has(value) && this.sketch.children.get(value) !== this) {
      throw new Error(`ID "${value}" already exists in sketch`);
    }
    this._id = value;
  }

  /**
   * methods are here
   */

  update(canvas, handlerArgs = []) {
    if (this.renderable) {
      try {
        this._update(canvas);
      } catch (e) {
        this.error(e);
      }
    }
    if (this.handlers.onupdate) {
      this.handlers.onupdate(...handlerArgs);
    }
  }

  draw(canvas) {
    if (this.renderable) {
      this._draw(canvas);
    }
  }

  _update(canvas) { }

  _draw(canvas) { }

  remove(handlerArgs = []) {
    this._remove();
    this.sketch.children.delete(this.id);
    if (this.handlers.onremove) this.handlers.onremove(...handlerArgs);
  }

  _remove() { }

  error(e) {
    if (this.handlers.onerror) {
      this.handlers.onerror(e);
    } else {
      console.error('GraphChild error:', e);
    }
  }
}

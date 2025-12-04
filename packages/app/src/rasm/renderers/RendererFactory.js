import { Empty, EvalExpr, Func, Slider, Variable, Xfunction } from '../../core/GraphChildren/index.js';
import EmptyRenderer from './EmptyRenderer.js';
import EvalExprRenderer from './EvalExprRenderer.js';
import SliderRenderer from './SliderRenderer.js';
import VariableRenderer from './VariableRenderer.js';
import XfunctionRenderer from './XfunctionRenderer.js';

/**
 * Factory for creating the appropriate renderer for a graph child.
 * This eliminates the need for instanceof checks throughout the code.
 */
const RendererFactory = {
  /**
   * Create a renderer for the given graph child
   * @param {GraphChild} graphChild - The graph child to create a renderer for
   * @param {ChildControl} control - The control that owns this renderer
   * @returns {BaseRenderer} The appropriate renderer instance
   */
  create(graphChild, control) {
    if (graphChild instanceof Empty) {
      return new EmptyRenderer(control, graphChild);
    }

    if (graphChild instanceof Xfunction) {
      return new XfunctionRenderer(control, graphChild);
    }

    if (graphChild instanceof EvalExpr) {
      return new EvalExprRenderer(control, graphChild);
    }

    if (graphChild instanceof Variable) {
      return new VariableRenderer(control, graphChild);
    }

    if (graphChild instanceof Slider) {
      return new SliderRenderer(control, graphChild);
    }

    // Fallback to empty renderer for unknown types
    console.warn(`No renderer found for ${graphChild.constructor.name}, using EmptyRenderer`);
    return new EmptyRenderer(control, graphChild);
  }
};

export default RendererFactory;

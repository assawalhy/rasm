import BaseRenderer from './BaseRenderer.js';

/**
 * Renderer for Variable graph children (simple variables)
 */
export default class VariableRenderer extends BaseRenderer {
  render(container) {
    // Variables don't have special UI elements
    // Just initialize sliderProps as empty object for compatibility
    this.control.sliderProps = {};
  }

  update() {
    // Nothing to update for variables
  }
}

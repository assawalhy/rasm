import BaseRenderer from './BaseRenderer.js';

/**
 * Renderer for Empty graph children (no content)
 */
export default class EmptyRenderer extends BaseRenderer {
  render(container) {
    // Empty graph children don't render anything special
  }

  update() {
    // Nothing to update for empty
  }
}

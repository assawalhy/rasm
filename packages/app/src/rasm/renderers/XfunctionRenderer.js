import sketch from '../sketch.js';
import BaseRenderer from './BaseRenderer.js';

/**
 * Renderer for Xfunction graph children (plottable functions)
 */
export default class XfunctionRenderer extends BaseRenderer {
  render(container) {
    const sideStatus = this.control.elt.querySelector('.side-status');

    // Create visibility toggle element
    const visibleElt = this.createElement(`
      <div class="visible-elt special-elt visible">
        <div class="inner"></div>
      </div>
    `);

    this.addEventListener(visibleElt, 'click', () => {
      visibleElt.classList.toggle('visible');
      this.graphChild.renderable = visibleElt.classList.contains('visible');
      this.graphChild.update();
      sketch.draw();
    });

    sideStatus.appendChild(visibleElt);
    this.elements.visibleElt = visibleElt;

    this.update();
  }

  update() {
    if (this.elements.visibleElt) {
      this.elements.visibleElt.setAttribute('style', `--color: ${this.graphChild.pen.color.toString()}`);
    }
  }
}

/**
 * Base class for all graph child renderers.
 * Each renderer is responsible for creating, updating, and cleaning up
 * the UI for a specific type of graph child.
 */
export default class BaseRenderer {
  constructor(control, graphChild) {
    this.control = control;
    this.graphChild = graphChild;
    this.elements = {}; // Store references to created DOM elements
  }

  /**
   * Render the UI for this graph child type.
   * @param {HTMLElement} container - The container element to render into
   */
  render(container) {
    throw new Error('Subclasses must implement render()');
  }

  /**
   * Update the UI when the graph child's data changes.
   */
  update() {
    throw new Error('Subclasses must implement update()');
  }

  /**
   * Helper: Create a DOM element from HTML string
   */
  createElement(html) {
    const template = document.createElement('div');
    template.innerHTML = html.trim();
    return template.firstElementChild;
  }

  /**
   * Helper: Fade in an element with animation
   */
  fadeIn(element, duration = 300) {
    element.style.display = 'none';
    setTimeout(() => {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = '0';
      element.style.display = '';
      setTimeout(() => {
        element.style.opacity = '1';
      }, 10);
    }, 0);
  }

  /**
   * Helper: Add event listener and track it for cleanup
   */
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);

    // Store for cleanup
    if (!this._eventListeners) {
      this._eventListeners = [];
    }
    this._eventListeners.push({ element, event, handler });
  }

  /**
   * Override cleanup to also remove event listeners
   */
  cleanup() {
    // Remove event listeners
    if (this._eventListeners) {
      this._eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this._eventListeners = [];
    }

    // Remove DOM elements
    Object.values(this.elements).forEach((element) => {
      element?.remove?.();
    });
    this.elements = {};
  }
}

import Sketch from '../core/Sketch.js';

/**
 * Sketch instance holder for SolidJS app
 * Provides lazy initialization after canvas mount
 */
let sketchInstance = null;

/**
 * Initialize the sketch with canvas elements
 * @param {HTMLCanvasElement} mainCanvas - Main canvas for coordinates/grid
 * @param {HTMLCanvasElement} childrenCanvas - Canvas for graph children
 * @returns {Sketch} The initialized sketch instance
 */
export function initSketch(mainCanvas, childrenCanvas) {
  if (sketchInstance) {
    console.warn('Sketch already initialized');
    return sketchInstance;
  }

  sketchInstance = new Sketch(mainCanvas, childrenCanvas);
  return sketchInstance;
}

/**
 * Get the sketch instance
 * @returns {Sketch|null} The sketch instance or null if not initialized
 */
export function getSketch() {
  return sketchInstance;
}

/**
 * Check if sketch is initialized
 * @returns {boolean}
 */
export function isSketchReady() {
  return sketchInstance !== null;
}


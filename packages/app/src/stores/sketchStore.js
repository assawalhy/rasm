import { createStore } from 'solid-js/store';
import { getSketch } from './sketchInstance.js';

/**
 * Global sketch store for managing canvas state and draw queue
 */
const [sketchState, setSketchState] = createStore({
  canvas: null,
  ctx: null,
  childrenCanvas: null,
  childrenCtx: null,
  settings: {
    gridVisible: true,
    axesVisible: true,
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  },
  needsRedraw: false,
  isDrawing: false,
  pendingRedraw: false,
});

/**
 * Update sketch settings
 */
function updateSettings(settings) {
  setSketchState('settings', settings);
  requestRedraw();
}

/**
 * Mark sketch for redraw - uses draw queue to avoid blocking
 */
function requestRedraw() {
  const sketch = getSketch();
  if (!sketch) {
    // Sketch not initialized yet, mark for later
    setSketchState('needsRedraw', true);
    return;
  }

  if (sketchState.isDrawing) {
    // Already drawing, queue for after current draw finishes
    setSketchState('pendingRedraw', true);
    return;
  }

  // Start drawing
  setSketchState('isDrawing', true);
  setSketchState('needsRedraw', false);

  // Use requestAnimationFrame for non-blocking draw
  requestAnimationFrame(() => {
    performDraw();
  });
}

/**
 * Perform the actual draw operation
 */
function performDraw() {
  const sketch = getSketch();
  if (!sketch) {
    setSketchState('isDrawing', false);
    return;
  }

  try {
    // Update and draw all children
    sketch.update({ redraw: true, redrawCoors: true });
  } catch (e) {
    console.error('Draw error:', e);
  }

  setSketchState('isDrawing', false);

  // Check if another redraw was requested while drawing
  if (sketchState.pendingRedraw) {
    setSketchState('pendingRedraw', false);
    // Schedule next draw on next frame
    requestAnimationFrame(() => {
      requestRedraw();
    });
  }
}

/**
 * Force immediate redraw (bypasses queue for initial/resize)
 */
function forceRedraw() {
  const sketch = getSketch();
  if (sketch) {
    sketch.update({ redraw: true, redrawCoors: true });
  }
}

export { sketchState, setSketchState, updateSettings, requestRedraw, forceRedraw, performDraw };

import { getSketch, initSketch, isSketchReady } from '@stores/sketchInstance';
import { forceRedraw, requestRedraw, setSketchState, sketchState } from '@stores/sketchStore';
import { createEffect, onCleanup, onMount } from 'solid-js';
import styles from './Sketch.module.scss';

/**
 * Sketch component - manages dual canvases and drawing
 * Main canvas: coordinates/grid
 * Children canvas: graph children (functions, points, etc.)
 */
export default function Sketch() {
  let mainCanvasRef;
  let childrenCanvasRef;

  onMount(() => {
    if (!mainCanvasRef || !childrenCanvasRef) return;

    // Initialize the sketch instance with both canvases
    const sketch = initSketch(mainCanvasRef, childrenCanvasRef);

    // Store canvas references in sketch state
    setSketchState('canvas', mainCanvasRef);
    setSketchState('ctx', mainCanvasRef.getContext('2d'));
    setSketchState('childrenCanvas', childrenCanvasRef);
    setSketchState('childrenCtx', childrenCanvasRef.getContext('2d'));

    // Set canvas sizes
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial draw
    forceRedraw();
  });

  createEffect(() => {
    // React to needsRedraw flag changes when sketch is ready
    if (sketchState.needsRedraw && isSketchReady()) {
      requestRedraw();
    }
  });

  onCleanup(() => {
    window.removeEventListener('resize', resizeCanvas);
  });

  function resizeCanvas() {
    if (!mainCanvasRef || !childrenCanvasRef) return;

    const container = mainCanvasRef.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Resize both canvases
    mainCanvasRef.width = width;
    mainCanvasRef.height = height;
    childrenCanvasRef.width = width;
    childrenCanvasRef.height = height;

    // Update sketch dimensions if initialized
    const sketch = getSketch();
    if (sketch) {
      sketch.canvas.resize(width, height);
      sketch.childrenCanvas.resize(width, height);

      // Update graph settings
      sketch.gs.width = width;
      sketch.gs.height = height;

      // Force redraw after resize
      forceRedraw();
    }
  }

  return (
    <div class={styles.canvasWrapper}>
      <canvas ref={mainCanvasRef} class={styles.mainCanvas} />
      <canvas ref={childrenCanvasRef} class={styles.childrenCanvas} />
    </div>
  );
}

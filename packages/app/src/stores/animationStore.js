import { createStore } from 'solid-js/store';
import { requestRedraw } from './sketchStore';
import { graphSettings } from './graphSettingsStore';

const [animationState, setAnimationState] = createStore({
  playingSliders: {}, // Map of sliderId -> updateFunction
  isPlaying: false,
});

let animationFrameId;

const loop = () => {
  if (!animationState.isPlaying) return;

  const sliders = Object.values(animationState.playingSliders);
  if (sliders.length === 0) {
    stopAnimation();
    return;
  }

  // Batch update all sliders
  sliders.forEach((updateFn) => {
    updateFn();
  });

  requestRedraw();

  // Request a single render for the sketch
  // We need a way to tell the sketch to render.
  // Assuming graphSettingsStore or similar has a trigger, or we access the sketch directly.
  // Looking at Xfunction.js, it uses graphSettings.
  // We might not have a direct "render" method exposed globally yet.
  // But wait, the slider update usually triggers a render via its handler.
  // If we want to BATCH, we should suppress individual renders and trigger one here.

  // For now, let's just run the updates. If the individual updates trigger renders, 
  // we might have over-rendering, but let's get the loop working first.
  // *Self-correction*: The requirement is "single rendering cycle".
  // The `Sketch` object usually has a `draw()` method.
  // We need to access the active sketch instance.

  // If we look at `Xfunction.js`, it takes `sketch` in constructor.
  // The `controlsStore` doesn't seem to hold the sketch instance directly, but `graphChild` does.
  // Let's assume for now we can trigger a draw via a global or by finding the sketch from a child.

  // Actually, if we update the values in `Math[id]`, the next render will pick them up.
  // We need to trigger that render.
  // Let's try to find where the main render loop or trigger is.
  // `CanvasContainer` likely holds the sketch.

  // For this first pass, I'll rely on the fact that if I can get a hold of the render trigger, I'll call it.
  // If not, I might need to expose it.

  animationFrameId = requestAnimationFrame(loop);
};

const startAnimation = () => {
  if (animationState.isPlaying) return;
  setAnimationState('isPlaying', true);
  loop();
};

const stopAnimation = () => {
  setAnimationState('isPlaying', false);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
};

const registerSlider = (id, updateFn) => {
  setAnimationState('playingSliders', id, () => updateFn);
  if (!animationState.isPlaying) {
    startAnimation();
  }
};

const unregisterSlider = (id) => {
  setAnimationState('playingSliders', id, undefined);
  if (Object.keys(animationState.playingSliders).length === 0) {
    stopAnimation();
  }
};

export {
  animationState,
  registerSlider,
  unregisterSlider,
  startAnimation,
  stopAnimation
};

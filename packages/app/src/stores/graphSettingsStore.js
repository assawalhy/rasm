import { Angles, Vector, Core } from '@rasm/math';
import { createStore } from 'solid-js/store';
import { requestRedraw } from './sketchStore.js';
import { createEffect } from 'solid-js';

/**
 * Graph settings store - manages viewport, transform, and coordinate system
 * Supports axis rotation, 2x2 transform matrix, and origin-centered zoom
 */

// Configuration
const ZOOM_RATIO = 1.1;
const ZOOM_LIMITS = [80, 180];
const ANGLE_MARGIN = Angles.deg(20); // Minimum angle between axes
const ORIGIN_SNAP_RADIUS = 10; // Radius for origin-centered zoom

const [graphSettings, setGraphSettings] = createStore({
  // Viewport in mathematical coordinates
  viewport: {
    xmin: -10,
    xmax: 10,
    ymin: -10,
    ymax: 10,
  },

  // Center of coordinate system in pixels
  center: { x: 0, y: 0 },

  // Space between grid lines in pixels
  xSpace: 120,
  ySpace: 120,

  // Value represented by one space (1, 2, 5, 10, 20, 50, etc.)
  xSpaceValue: 2,
  ySpaceValue: 2,

  // Zooming state for 1-2-5 sequence
  xZoomingState: 2,
  yZoomingState: 2,

  // Axis angles in radians (0 = right, PI/2 = up)
  xAngle: 0,
  yAngle: Math.PI / 2,

  // 2x2 transformation matrix + translation
  // | a  c  e |   a,b = iVector (x-axis direction)
  // | b  d  f |   c,d = jVector (y-axis direction)
  //               e,f = center (translation)
  transform: { a: 1, b: 0, c: 0, d: -1, e: 0, f: 0 },

  // Inverse matrix components for pixel→math conversion
  inverseTransform: { ia: 1, ib: 0, ic: 0, id: -1 },

  // Transform origin for zoom centering
  transformOrigin: null, // { px: {x, y}, math: {x, y} }

  // Current mouse position (pixels)
  mouse: { x: 0, y: 0 },

  // Canvas dimensions
  width: 0,
  height: 0,
});

/**
 * Get the scale factors (pixels per unit)
 */
function getScale() {
  // Scale is increase for for non-orthogonal axes
  const angleDiff = Math.abs(graphSettings.xAngle - graphSettings.yAngle);
  const moreScale = Math.abs(Math.cos(angleDiff));
  return {
    x: (graphSettings.xSpace * (1 + moreScale)) / graphSettings.xSpaceValue,
    y: (graphSettings.ySpace * (1 + moreScale)) / graphSettings.ySpaceValue,
  };
}

/**
 * Get iVector (x-axis unit vector in pixel space)
 */
function getIVector() {
  const scale = getScale();
  return Vector.fromAngle(-graphSettings.xAngle).mult(scale.x);
}

/**
 * Get jVector (y-axis unit vector in pixel space)
 */
function getJVector() {
  const scale = getScale();
  return Vector.fromAngle(-graphSettings.yAngle).mult(scale.y);
}

/**
 * Update the 2x2 transformation matrix from current angles, scales, and center
 */
function updateTransformMatrix() {
  const i = getIVector();
  const j = getJVector();
  const c = graphSettings.center;

  const transform = { a: i.x, b: i.y, c: j.x, d: j.y, e: c.x, f: c.y };

  // Calculate inverse matrix for pixel→math conversion
  const det = transform.a * transform.d - transform.c * transform.b;
  const inverseTransform = {
    ia: transform.d / det,
    ib: -transform.b / det,
    ic: -transform.c / det,
    id: transform.a / det,
  };

  setGraphSettings({ transform, inverseTransform });
}

/**
 * Initialize with canvas dimensions
 */
function initGraphSettings(width, height) {
  setGraphSettings({
    width,
    height,
    center: { x: width / 2, y: height / 2 },
  });
  updateTransformMatrix();
  updateViewport();
}

/**
 * Update dimensions on resize
 */
function updateDimensions(width, height) {
  setGraphSettings({ width, height });
  updateTransformMatrix();
  updateViewport();
}

/**
 * Convert pixel position to math coordinates (using matrix inverse)
 */
function pixelToMath(px, py) {
  const { e, f } = graphSettings.transform;
  const { ia, ib, ic, id } = graphSettings.inverseTransform;

  const dx = px - e;
  const dy = py - f;

  return {
    x: ia * dx + ic * dy,
    y: ib * dx + id * dy,
  };
}

/**
 * Convert math coordinates to pixel position (using matrix)
 */
function mathToPixel(mx, my) {
  const { a, b, c, d, e, f } = graphSettings.transform;
  return {
    x: a * mx + c * my + e,
    y: b * mx + d * my + f,
  };
}

/**
 * Convert math X coordinate to pixel X
 */
function xToPixel(mx, my) {
  const { a, c, e } = graphSettings.transform;
  return a * mx + c * my + e;
}

/**
 * Convert math Y coordinate to pixel Y
 */
function yToPixel(mx, my) {
  const { b, d, f } = graphSettings.transform;
  return b * mx + d * my + f;
}

/**
 * Update viewport based on current transform
 */
function updateViewport() {
  const { width, height, xAngle, yAngle } = graphSettings;

  // Calculate viewport corners considering axis rotation
  const xStart = pixelToMath(0, Math.tan(yAngle) > 0 ? 0 : height).x;
  const xEnd = pixelToMath(width, Math.tan(yAngle) <= 0 ? 0 : height).x;
  const yStart = pixelToMath(Math.tan(xAngle) > 0 ? width : 0, height).y;
  const yEnd = pixelToMath(Math.tan(xAngle) <= 0 ? width : 0, 0).y;

  setGraphSettings('viewport', {
    xmin: Math.min(xStart, xEnd),
    xmax: Math.max(xStart, xEnd),
    ymin: Math.min(yStart, yEnd),
    ymax: Math.max(yStart, yEnd),
  });
}

/**
 * Pan the view by pixel delta
 */
function pan(dx, dy) {
  setGraphSettings('center', {
    x: graphSettings.center.x + dx,
    y: graphSettings.center.y + dy,
  });
  updateTransformMatrix();
  updateViewport();
  requestRedraw();
}



/**
 * Constrain angle with margin to prevent axes from overlapping
 */
function constrainXAngle(a) {
  let yAng = graphSettings.yAngle;

  if (Angles.minAngle(Vector.fromAngle(a), Vector.fromAngle(yAng), { type: 'lines' }) < ANGLE_MARGIN) {
    // Snap to valid position
    let b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(yAng), { dir: 'clockwise' });
    if (b < ANGLE_MARGIN && b > 0) {
      return Angles.constrainAngle(yAng + ANGLE_MARGIN);
    }
    b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(yAng));
    if (b < ANGLE_MARGIN && b > 0) {
      return Angles.constrainAngle(yAng - ANGLE_MARGIN);
    }
    yAng += Math.PI;
    b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(yAng), { dir: 'clockwise' });
    if (b < ANGLE_MARGIN && b > 0) {
      return Angles.constrainAngle(yAng + ANGLE_MARGIN);
    }
    b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(yAng));
    if (b < ANGLE_MARGIN && b > 0) {
      return Angles.constrainAngle(yAng - ANGLE_MARGIN);
    }
  }
  return Angles.constrainAngle(a);
}

function constrainYAngle(a) {
  let xAng = graphSettings.xAngle;

  if (Angles.minAngle(Vector.fromAngle(a), Vector.fromAngle(xAng), { type: 'lines' }) < ANGLE_MARGIN) {
    // Snap to valid position
    let b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(xAng), { dir: 'clockwise' });
    if (b < ANGLE_MARGIN && b > 0) {
      return Angles.constrainAngle(xAng + ANGLE_MARGIN);
    }
    b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(xAng));
    if (b < ANGLE_MARGIN && b > 0) {
      return Angles.constrainAngle(xAng - ANGLE_MARGIN);
    }
    xAng += Math.PI;
    b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(xAng), { dir: 'clockwise' });
    if (b < ANGLE_MARGIN && b > 0) {
      return Angles.constrainAngle(xAng + ANGLE_MARGIN);
    }
    b = Angles.angle(Vector.fromAngle(a), Vector.fromAngle(xAng));
    if (b < ANGLE_MARGIN && b > 0) {
      return Angles.constrainAngle(xAng - ANGLE_MARGIN);
    }
  }
  return Angles.constrainAngle(a);
}

/**
 * Set X axis angle with constraint
 */
function setXAngle(angle) {
  setGraphSettings('xAngle', constrainXAngle(angle));
  updateTransformMatrix();
  updateViewport();
  requestRedraw();
}

/**
 * Set Y axis angle with constraint
 */
function setYAngle(angle) {
  setGraphSettings('yAngle', constrainYAngle(angle));
  updateTransformMatrix();
  updateViewport();
  requestRedraw();
}

/**
 * Rotate both axes by an angle
 */
function rotate(angle) {
  setGraphSettings({
    xAngle: graphSettings.xAngle + angle,
    yAngle: graphSettings.yAngle + angle,
  });
  updateTransformMatrix();
  updateViewport();
  requestRedraw();
}

/**
 * Reform space value to keep it in nice 1-2-5 sequence
 */
function reformXSpace() {
  let { xSpace, xSpaceValue, xZoomingState } = graphSettings;

  while (xSpace > ZOOM_LIMITS[1]) {
    if (xZoomingState === 5) {
      xZoomingState = 2;
      const ratio = 2 / 5;
      xSpaceValue *= ratio;
      xSpace *= ratio;
    } else if (xZoomingState === 2) {
      xZoomingState = 1;
      const ratio = 1 / 2;
      xSpaceValue *= ratio;
      xSpace *= ratio;
    } else {
      xZoomingState = 5;
      const ratio = 0.5 / 1;
      xSpaceValue *= ratio;
      xSpace *= ratio;
    }
  }

  while (xSpace < ZOOM_LIMITS[0]) {
    if (xZoomingState === 1) {
      xZoomingState = 2;
      const ratio = 2 / 1;
      xSpaceValue *= ratio;
      xSpace *= ratio;
    } else if (xZoomingState === 2) {
      xZoomingState = 5;
      const ratio = 5 / 2;
      xSpaceValue *= ratio;
      xSpace *= ratio;
    } else {
      xZoomingState = 1;
      const ratio = 10 / 5;
      xSpaceValue *= ratio;
      xSpace *= ratio;
    }
  }

  setGraphSettings({ xSpace, xSpaceValue, xZoomingState });
}

function reformYSpace() {
  let { ySpace, ySpaceValue, yZoomingState } = graphSettings;

  while (ySpace > ZOOM_LIMITS[1]) {
    if (yZoomingState === 5) {
      yZoomingState = 2;
      const ratio = 2 / 5;
      ySpaceValue *= ratio;
      ySpace *= ratio;
    } else if (yZoomingState === 2) {
      yZoomingState = 1;
      const ratio = 1 / 2;
      ySpaceValue *= ratio;
      ySpace *= ratio;
    } else {
      yZoomingState = 5;
      const ratio = 0.5 / 1;
      ySpaceValue *= ratio;
      ySpace *= ratio;
    }
  }

  while (ySpace < ZOOM_LIMITS[0]) {
    if (yZoomingState === 1) {
      yZoomingState = 2;
      const ratio = 2 / 1;
      ySpaceValue *= ratio;
      ySpace *= ratio;
    } else if (yZoomingState === 2) {
      yZoomingState = 5;
      const ratio = 5 / 2;
      ySpaceValue *= ratio;
      ySpace *= ratio;
    } else {
      yZoomingState = 1;
      const ratio = 10 / 5;
      ySpaceValue *= ratio;
      ySpace *= ratio;
    }
  }

  setGraphSettings({ ySpace, ySpaceValue, yZoomingState });
}

/**
 * Set transform origin for zoom (stores both pixel and math coordinates)
 */
function setTransformOrigin(px, py) {
  if (px === null || py === null) {
    setGraphSettings('transformOrigin', null);
    return;
  }

  const math = pixelToMath(px, py);
  setGraphSettings('transformOrigin', {
    px: { x: px, y: py },
    math: { x: math.x, y: math.y },
  });
}

/**
 * Adjust center to keep transform origin fixed after zoom
 */
function adjustCenterToOrigin() {
  const origin = graphSettings.transformOrigin;
  if (!origin) return;

  const newPx = mathToPixel(origin.math.x, origin.math.y);
  const dx = origin.px.x - newPx.x;
  const dy = origin.px.y - newPx.y;

  setGraphSettings('center', {
    x: graphSettings.center.x + dx,
    y: graphSettings.center.y + dy,
  });
  updateTransformMatrix();
}

/**
 * Zoom in at a specific point
 * If within ORIGIN_SNAP_RADIUS of origin, zooms at origin
 */
function zoomIn(centerX, centerY) {
  const cx = centerX ?? graphSettings.width / 2;
  const cy = centerY ?? graphSettings.height / 2;

  // Check if near origin - snap to origin
  const { center } = graphSettings;
  const distToOrigin = Math.sqrt((cx - center.x) ** 2 + (cy - center.y) ** 2);

  if (distToOrigin < ORIGIN_SNAP_RADIUS) {
    setTransformOrigin(center.x, center.y);
  } else {
    setTransformOrigin(cx, cy);
  }

  // Increase space (zoom in)
  setGraphSettings({
    xSpace: graphSettings.xSpace * ZOOM_RATIO,
    ySpace: graphSettings.ySpace * ZOOM_RATIO,
  });

  reformXSpace();
  reformYSpace();
  updateTransformMatrix();
  adjustCenterToOrigin();
  updateViewport();
  setTransformOrigin(null, null);
  requestRedraw();
}

/**
 * Zoom out at a specific point
 * If within ORIGIN_SNAP_RADIUS of origin, zooms at origin
 */
function zoomOut(centerX, centerY) {
  const cx = centerX ?? graphSettings.width / 2;
  const cy = centerY ?? graphSettings.height / 2;

  // Check if near origin - snap to origin
  const { center } = graphSettings;
  const distToOrigin = Math.sqrt((cx - center.x) ** 2 + (cy - center.y) ** 2);

  if (distToOrigin < ORIGIN_SNAP_RADIUS) {
    setTransformOrigin(center.x, center.y);
  } else {
    setTransformOrigin(cx, cy);
  }

  // Decrease space (zoom out)
  setGraphSettings({
    xSpace: graphSettings.xSpace / ZOOM_RATIO,
    ySpace: graphSettings.ySpace / ZOOM_RATIO,
  });

  reformXSpace();
  reformYSpace();
  updateTransformMatrix();
  adjustCenterToOrigin();
  updateViewport();
  setTransformOrigin(null, null);
  requestRedraw();
}

/**
 * Reset to default view
 */
function resetView() {
  const { width, height } = graphSettings;

  setGraphSettings({
    center: { x: width / 2, y: height / 2 },
    xSpace: 120,
    ySpace: 120,
    xSpaceValue: 2,
    ySpaceValue: 2,
    xZoomingState: 2,
    yZoomingState: 2,
    xAngle: 0,
    yAngle: Math.PI / 2,
    transformOrigin: null,
  });

  updateTransformMatrix();
  updateViewport();
  requestRedraw();
}

/**
 * Center the origin in the view
 */
function centerOrigin() {
  const { width, height } = graphSettings;

  setGraphSettings('center', {
    x: width / 2,
    y: height / 2,
  });

  updateTransformMatrix();
  updateViewport();
  requestRedraw();
}

/**
 * Update mouse position
 */
function updateMouse(x, y) {
  setGraphSettings('mouse', { x, y });
}



export {
  graphSettings,
  setGraphSettings,
  initGraphSettings,
  updateDimensions,
  getScale,
  getIVector,
  getJVector,
  pixelToMath,
  mathToPixel,
  xToPixel,
  yToPixel,
  pan,
  setXAngle,
  setYAngle,
  rotate,
  reformXSpace,
  reformYSpace,
  zoomIn,
  zoomOut,
  resetView,
  centerOrigin,
  updateMouse,
  updateTransformMatrix,
  updateViewport,
  setTransformOrigin,
  ANGLE_MARGIN,
  ORIGIN_SNAP_RADIUS,
};

createEffect(() => {
  console.log({ ...graphSettings });
});
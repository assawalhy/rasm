import { getSketch, initSketch } from "@stores/sketchInstance";
import {
  graphSettings,
  initGraphSettings,
  pan,
  updateDimensions,
  updateMouse,
  zoomIn,
  zoomOut,
  setXAngle,
  setYAngle,
  setGraphSettings,
  reformXSpace,
  reformYSpace,
} from "@stores/graphSettingsStore";
import {
  forceRedraw,
  requestRedraw,
  setSketchState,
} from "@stores/sketchStore";
import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import styles from "./Sketch.module.scss";
import { Angles, Core, Lines, Vector } from "@rasm/math";

const ROTATE_CENTER_BUFFER = 10;

/**
 * Sketch component - manages dual canvases and drawing
 * Main canvas: coordinates/grid
 * Children canvas: graph children (functions, points, etc.)
 */
export default function Sketch(props) {
  let mainCanvasRef;
  let childrenCanvasRef;
  let wrapperRef;

  // Local state for interaction
  const [activeAxis, setActiveAxis] = createSignal(null);
  const [isDragging, setIsDragging] = createSignal(false);
  let dragStart = { x: 0, y: 0 };

  let interactionState = {
    active: false,
    axis: null, // 'x', 'y', 'xy'
    startMouse: null,
    startXAngle: null,
    startYAngle: null,
    startVal: null, // Initial space or angle
    increment: 0,
  };

  onMount(() => {
    if (!mainCanvasRef || !childrenCanvasRef) return;

    // Initialize the sketch instance with both canvases
    initSketch(mainCanvasRef, childrenCanvasRef);

    // Store canvas references in sketch state
    setSketchState("canvas", mainCanvasRef);
    setSketchState("ctx", mainCanvasRef.getContext("2d"));
    setSketchState("childrenCanvas", childrenCanvasRef);
    setSketchState("childrenCtx", childrenCanvasRef.getContext("2d"));

    // Set canvas sizes and init graph settings
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initial draw
    forceRedraw();
  });

  // Sync activeAxis to core sketch for rendering
  createEffect(
    on(activeAxis, () => {
      const sketch = getSketch();
      if (sketch) {
        sketch.activeAxis = activeAxis();
        requestRedraw();
      }
    })
  );

  onCleanup(() => {
    window.removeEventListener("resize", resizeCanvas);
  });

  function resizeCanvas() {
    if (!mainCanvasRef || !childrenCanvasRef || !wrapperRef) return;

    const width = wrapperRef.clientWidth;
    const height = wrapperRef.clientHeight;

    // Resize both canvases
    mainCanvasRef.width = width;
    mainCanvasRef.height = height;
    childrenCanvasRef.width = width;
    childrenCanvasRef.height = height;

    // Update graph settings store
    if (graphSettings.width === 0) {
      // First init
      initGraphSettings(width, height);
    } else {
      updateDimensions(width, height);
    }

    // Update sketch canvas objects if initialized
    const sketch = getSketch();
    if (sketch) {
      sketch.canvas.resize(width, height);
      sketch.childrenCanvas.resize(width, height);
      sketch.width = width;
      sketch.height = height;

      // Force redraw after resize
      forceRedraw();
    }
  }

  // Get position relative to canvas
  function getPosition(e) {
    const rect = wrapperRef.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function getAxisDistances(pos) {
    const center = new Vector(graphSettings.center.x, graphSettings.center.y);
    const mouseVec = new Vector(pos.x, pos.y);

    const xEq = Lines.lineEquation(-graphSettings.xAngle, center);
    const yEq = Lines.lineEquation(-graphSettings.yAngle, center);

    return {
      x: Lines.distToLine(mouseVec, xEq),
      y: Lines.distToLine(mouseVec, yEq),
    };
  }

  // Global event handlers for dragging outside canvas
  const handleWindowMove = (e) => handlePointerMove(e);
  const handleWindowUp = (e) => handlePointerUp(e);

  function addGlobalListeners() {
    window.addEventListener("mousemove", handleWindowMove);
    window.addEventListener("mouseup", handleWindowUp);
    window.addEventListener("touchmove", handleWindowMove, { passive: false });
    window.addEventListener("touchend", handleWindowUp);
  }

  function removeGlobalListeners() {
    window.removeEventListener("mousemove", handleWindowMove);
    window.removeEventListener("mouseup", handleWindowUp);
    window.removeEventListener("touchmove", handleWindowMove);
    window.removeEventListener("touchend", handleWindowUp);
  }

  // Mouse/touch event handlers
  function handlePointerDown(e) {
    const pos = getPosition(e);

    // Handle generic pan first if default mode
    if (props.interactionMode === "pan") {
      setIsDragging(true);
      dragStart = { x: pos.x, y: pos.y };

      addGlobalListeners();
      e.preventDefault();
      return;
    }

    // Handle Scale/Rotate interactions
    const dists = getAxisDistances(pos);
    const threshold = 30;

    let axis = null;
    if (dists.x < threshold && dists.y < threshold) axis = "xy";
    else if (dists.x < threshold) axis = "x";
    else if (dists.y < threshold) axis = "y";

    if (axis) {
      interactionState = {
        active: true,
        axis,
        startMouse: new Vector(pos.x, pos.y),
        increment: 0,
        startXAngle: graphSettings.xAngle,
        startYAngle: graphSettings.yAngle,
      };

      setActiveAxis(axis);
      addGlobalListeners();
      e.preventDefault();
    }
  }

  function handlePointerMove(e) {
    const pos = getPosition(e);

    if (props.interactionMode === "pan") {
      if (isDragging()) {
        const dx = pos.x - dragStart.x;
        const dy = pos.y - dragStart.y;
        pan(dx, dy);
        dragStart = { x: pos.x, y: pos.y };

        e.preventDefault();
      }
      return;
    }

    if (interactionState.active) {
      if (props.interactionMode === "scale_axis") {
        handleScaleAxis(pos);
      } else if (props.interactionMode === "rotate_axis") {
        handleRotateAxis(pos);
      }
      e.preventDefault();
    }
  }

  function handleAxesHover(e) {
    const pos = getPosition(e);
    updateMouse(pos.x, pos.y);

    if (props.interactionMode === "pan" || interactionState.active) return;

    const dists = getAxisDistances(pos);
    const threshold = 30; // same threshold as click

    let axis = null;
    if (dists.x < threshold && dists.y < threshold) axis = "xy";
    else if (dists.x < threshold) axis = "x";
    else if (dists.y < threshold) axis = "y";

    if (
      props.interactionMode === "rotate_axis" &&
      Core.dist(graphSettings.center.x, graphSettings.center.y, pos.x, pos.y) <
        ROTATE_CENTER_BUFFER
    ) {
      axis = null;
    }

    if (axis !== activeAxis()) {
      setActiveAxis(axis);
    }
  }

  function handleScaleAxis(pos) {
    const { axis, startMouse, increment } = interactionState;
    const center = new Vector(graphSettings.center.x, graphSettings.center.y);
    const mouseVec = new Vector(pos.x, pos.y);

    let angle = 0;
    if (axis === "x") angle = -graphSettings.xAngle;
    if (axis === "y") angle = -graphSettings.yAngle;
    if (axis === "xy")
      angle = -(graphSettings.xAngle + graphSettings.yAngle) / 2; // Approximate mid angle

    const axisLine = Lines.lineEquation(angle, center);

    // Logic from canvasEvents.js:
    // incre = sqrt(dist(mouse, startMouse)^2 - distToLine(mouse, axisLine)^2)
    const distMoved = Core.dist(pos.x, pos.y, startMouse.x, startMouse.y);
    const distToLine = Lines.distToLine(mouseVec, axisLine);

    const incre = Math.sqrt(Math.max(0, distMoved ** 2 - distToLine ** 2));

    if (!isNaN(incre)) {
      // Determine direction using angle check
      const mina = Angles.minAngle(
        Vector.fromAngle(angle),
        mouseVec.subtract(startMouse)
      );
      const dir = mina < Math.PI / 2 ? 1 : -1;

      const delta = incre * dir - increment;
      interactionState.increment = incre * dir;

      if (axis === "x") {
        setGraphSettings("xSpace", graphSettings.xSpace + delta);
        reformXSpace();
      } else if (axis === "y") {
        setGraphSettings("ySpace", graphSettings.ySpace + delta);
        reformYSpace();
      } else if (axis === "xy") {
        // Uniform scale
        const ratio = (graphSettings.ySpace + delta) / graphSettings.ySpace;
        // constrain ratio
        const constrainedRatio = Core.constrain(ratio, 0.9, 1.1);

        setGraphSettings({
          xSpace: graphSettings.xSpace * constrainedRatio,
          ySpace: graphSettings.ySpace * constrainedRatio,
        });
        reformXSpace();
        reformYSpace();
      }

      setGraphSettings("transformOrigin", {
        px: { x: center.x, y: center.y },
        math: { x: 0, y: 0 },
      }); // Keep origin fixed?
      updateDimensions(graphSettings.width, graphSettings.height); // Triggers matrix update
      requestRedraw();
    }
  }

  function handleRotateAxis(pos) {
    const { axis, startMouse, startXAngle, startYAngle } = interactionState;
    const center = new Vector(graphSettings.center.x, graphSettings.center.y);
    const mouseVec = new Vector(pos.x, pos.y);

    if (Core.dist(center.x, center.y, pos.x, pos.y) > 10) {
      const prevVec = startMouse.subtract(center);
      const currVec = mouseVec.subtract(center);

      const angle1 = Math.atan2(prevVec.y, prevVec.x);
      const angle2 = Math.atan2(currVec.y, currVec.x);
      let diff = angle2 - angle1;

      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;

      if (axis === "x") {
        setXAngle(startXAngle - diff);
      } else if (axis === "y") {
        setYAngle(startYAngle - diff);
      } else if (axis === "xy") {
        setXAngle(startXAngle - diff);
        setYAngle(startYAngle - diff);
      }

      interactionState.lastVec = currVec;
    }
  }

  function handlePointerUp() {
    if (props.interactionMode === "pan") {
      setIsDragging(false);
    }
    interactionState.active = false;
    interactionState.lastVec = null;

    // Clear active axis if we finished a drag interaction
    // (User might want to keep it if still hovering, but for now safe to clear)
    setActiveAxis(null);

    removeGlobalListeners();
  }

  function handleMouseLeave() {
    // Only clear if not dragging (dragging handles its own state via global listeners)
    if (!isDragging() && !interactionState.active) {
      setActiveAxis(null);
    }
  }

  function handleWheel(e) {
    e.preventDefault();
    const pos = getPosition(e);

    if (e.deltaY < 0) {
      zoomIn(pos.x, pos.y);
    } else {
      zoomOut(pos.x, pos.y);
    }
  }

  return (
    <div
      ref={wrapperRef}
      class={styles.canvasWrapper}
      style={{
        cursor:
          props.interactionMode === "pan"
            ? isDragging()
              ? "grabbing"
              : "grab"
            : activeAxis()
              ? "crosshair"
              : "pointer",
      }}
      onMouseMove={handleAxesHover}
      onMouseDown={handlePointerDown}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handlePointerDown}
      onTouchMove={handleAxesHover}
      onWheel={handleWheel}
    >
      <canvas ref={mainCanvasRef} class={styles.mainCanvas} />
      <canvas ref={childrenCanvasRef} class={styles.childrenCanvas} />
    </div>
  );
}

import CoordinatesDisplay from '@components/CoordinatesDisplay/CoordinatesDisplay';
import Sketch from '@components/Sketch/Sketch';
import { centerOrigin, resetView, zoomIn, zoomOut } from '@stores/graphSettingsStore';
import { createSignal } from 'solid-js';
import styles from './CanvasContainer.module.scss';

/**
 * Canvas container with sketch component and tool buttons
 */
export default function CanvasContainer() {
  const [interactionMode, setInteractionMode] = createSignal('pan'); // 'pan' | 'scale_axis' | 'rotate_axis'

  const handleZoomIn = () => {
    // Animated zoom (multiple steps)
    for (let i = 0; i < 5; i++) {
      setTimeout(() => zoomIn(), i * 30);
    }
  };

  const handleZoomOut = () => {
    // Animated zoom (multiple steps)
    for (let i = 0; i < 5; i++) {
      setTimeout(() => zoomOut(), i * 30);
    }
  };

  return (
    <div class={styles.canvasContainer}>
      <div class={styles.tools}>
        <button
          type="button"
          title="Pan Tool"
          class={interactionMode() === 'pan' ? styles.active : ''}
          onClick={() => setInteractionMode('pan')}
        >
          <i class="fas fa-arrows-alt" />
        </button>
        <button
          type="button"
          title="Scale Axes"
          class={interactionMode() === 'scale_axis' ? styles.active : ''}
          onClick={() => setInteractionMode('scale_axis')}
        >
          <i class="fas fa-expand-alt" />
        </button>
        <button
          type="button"
          title="Rotate Axes"
          class={interactionMode() === 'rotate_axis' ? styles.active : ''}
          onClick={() => setInteractionMode('rotate_axis')}
        >
          <i class="fas fa-sync-alt" />
        </button>

        <div style={{ width: '1px', background: '#eee', margin: '0 4px' }} />

        <button type="button" title="Reset View" onClick={resetView}>
          <i class="fas fa-home" />
        </button>
        <button type="button" title="Center Origin" onClick={centerOrigin}>
          <i class="fas fa-crosshairs" />
        </button>
        <button type="button" title="Zoom In" onClick={handleZoomIn}>
          <i class="fas fa-search-plus" />
        </button>
        <button type="button" title="Zoom Out" onClick={handleZoomOut}>
          <i class="fas fa-search-minus" />
        </button>
      </div>

      <div class={styles.coordinatesWrapper}>
        <CoordinatesDisplay />
      </div>

      <Sketch interactionMode={interactionMode()} />
    </div>
  );
}

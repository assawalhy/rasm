import CoordinatesDisplay from '@components/CoordinatesDisplay/CoordinatesDisplay';
import Sketch from '@components/Sketch/Sketch';
import { Button } from '@components/ui/button';
import { centerOrigin, resetView, zoomIn, zoomOut } from '@stores/graphSettingsStore';
import {
  IconArrowsMove,
  IconCrosshair,
  IconHome,
  IconMaximize,
  IconRotate,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-solidjs';
import { createSignal } from 'solid-js';
import styles from './CanvasContainer.module.scss';
import { css } from 'styled-system/css';

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
        <Button
          title="Pan Tool"
          class={css({
            bg: interactionMode() === 'pan' && 'blue.50 !important',
          })}
          size="sm"
          onClick={() => setInteractionMode('pan')}
        >
          <IconArrowsMove size={18} />
        </Button>
        <Button
          title="Scale Axes"
          class={css({
            bg: interactionMode() === 'scale_axis' && 'blue.50 !important',
          })}
          size="sm"
          onClick={() => setInteractionMode('scale_axis')}
        >
          <IconMaximize size={18} />
        </Button>
        <Button
          title="Rotate Axes"
          class={css({
            bg: interactionMode() === 'rotate_axis' && 'blue.50 !important',
          })}
          size="sm"
          onClick={() => setInteractionMode('rotate_axis')}
        >
          <IconRotate size={18} />
        </Button>

        <div style={{ width: '1px', background: '#eee', margin: '0 4px' }} />

        <Button title="Reset View" variant="ghost" size="sm" onClick={resetView}>
          <IconHome size={18} />
        </Button>
        <Button title="Center Origin" variant="ghost" size="sm" onClick={centerOrigin}>
          <IconCrosshair size={18} />
        </Button>
        <Button title="Zoom In" variant="ghost" size="sm" onClick={handleZoomIn}>
          <IconZoomIn size={18} />
        </Button>
        <Button title="Zoom Out" variant="ghost" size="sm" onClick={handleZoomOut}>
          <IconZoomOut size={18} />
        </Button>
      </div>

      <div class={styles.coordinatesWrapper}>
        <CoordinatesDisplay />
      </div>

      <Sketch interactionMode={interactionMode()} />
    </div>
  );
}

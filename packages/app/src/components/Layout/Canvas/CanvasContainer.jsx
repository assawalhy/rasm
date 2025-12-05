import Sketch from '@components/Sketch/Sketch';
import styles from './CanvasContainer.module.scss';

/**
 * Canvas container with sketch component
 */
export default function CanvasContainer() {
  return (
    <div class={styles.canvasContainer}>
      <Sketch />

      <div class={styles.tools}>
        <button type="button" title="Reset View">
          <i class="fas fa-home" />
        </button>
        <button type="button" title="Zoom In">
          <i class="fas fa-search-plus" />
        </button>
        <button type="button" title="Zoom Out">
          <i class="fas fa-search-minus" />
        </button>
        <button type="button" title="Settings">
          <i class="fas fa-cog" />
        </button>
      </div>
    </div>
  );
}

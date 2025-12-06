import { graphSettings, pixelToMath } from '@stores/graphSettingsStore';
import styles from './CoordinatesDisplay.module.scss';

/**
 * Displays current mouse position in mathematical coordinates
 */
export default function CoordinatesDisplay() {
  const mathPos = () => pixelToMath(graphSettings.mouse.x, graphSettings.mouse.y);

  return (
    <div class={styles.coordinatesDisplay}>
      <span class={styles.coord}>
        x: <span class={styles.value}>{mathPos().x.toFixed(2)}</span>
      </span>
      <span class={styles.coord}>
        y: <span class={styles.value}>{mathPos().y.toFixed(2)}</span>
      </span>
    </div>
  );
}

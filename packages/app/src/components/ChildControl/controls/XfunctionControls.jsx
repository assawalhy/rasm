import { createSignal } from 'solid-js';
import styles from './XfunctionControls.module.scss';

/**
 * XfunctionControls component - displays function with visibility toggle
 */
export default function XfunctionControls(props) {
  const [isVisible, setIsVisible] = createSignal(true);
  const [color, setColor] = createSignal('#667eea');

  const toggleVisibility = () => {
    setIsVisible(!isVisible());
    // Update graph child visibility
  };

  return (
    <div class={styles.xfunction}>
      <button
        type="button"
        class={styles.visibilityButton}
        classList={{ [styles.hidden]: !isVisible() }}
        onClick={toggleVisibility}
        title={isVisible() ? 'Hide' : 'Show'}
      >
        <i class={`fas fa-eye${isVisible() ? '' : '-slash'}`} />
      </button>

      <div class={styles.colorIndicator} style={{ 'background-color': color() }} />
    </div>
  );
}

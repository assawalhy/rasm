import { createSignal } from 'solid-js';
import styles from './EvalExprControls.module.scss';

/**
 * EvalExprControls component - displays evaluated expression results
 */
export default function EvalExprControls(props) {
  const [displayType, setDisplayType] = createSignal('decimal'); // decimal, fraction, quotient
  const [value, setValue] = createSignal('');

  const toggleDisplayType = () => {
    const types = ['decimal', 'fraction', 'quotient'];
    const currentIndex = types.indexOf(displayType());
    const nextIndex = (currentIndex + 1) % types.length;
    setDisplayType(types[nextIndex]);
  };

  return (
    <div class={styles.evalExpr}>
      <div class={styles.value}>
        = <span class={styles.result}>{value() || '0'}</span>
      </div>

      <button
        type="button"
        class={styles.toggleButton}
        onClick={toggleDisplayType}
        title={`Display as ${displayType()}`}
      >
        <i class={`fas fa-${getIcon(displayType())}`} />
      </button>
    </div>
  );
}

function getIcon(type) {
  switch (type) {
    case 'fraction':
      return 'divide';
    case 'quotient':
      return 'percentage';
    default:
      return 'calculator';
  }
}

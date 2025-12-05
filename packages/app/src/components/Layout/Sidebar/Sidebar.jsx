import ChildControl from '@components/ChildControl/ChildControl';
import { addControl, controls, focusControl, removeControl } from '@stores/controlsStore';
import { For } from 'solid-js';
import styles from './Sidebar.module.scss';

/**
 * Sidebar component containing controls list
 */
export default function Sidebar(props) {
  const handleAddControl = () => {
    const newControl = addControl();
    // Focus the new control after it's added
    focusControl(newControl.id);
  };

  const handleRemoveControl = (id) => {
    removeControl(id);
  };

  return (
    <div class={styles.sidebar} style={{ width: `${props.width}px` }}>
      <div class={styles.header}>
        <h1>Rasm</h1>
        <p>Mathematical Graphing Calculator</p>
      </div>

      <div class={styles.controls}>
        <For each={controls.list}>
          {(control, index) => (
            <ChildControl control={control} order={index() + 1} onRemove={() => handleRemoveControl(control.id)} />
          )}
        </For>
      </div>

      <div class={styles.addButton}>
        <button type="button" onClick={handleAddControl}>
          <i class="fas fa-plus" /> Add Expression
        </button>
      </div>
    </div>
  );
}

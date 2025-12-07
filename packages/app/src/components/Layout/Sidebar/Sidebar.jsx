import ChildControl from '@components/ChildControl/ChildControl';
import { Button } from '@components/ui/button';
import { addControl, controls, focusControl, removeControl, updateControl } from '@stores/controlsStore';
import { IconPlus } from '@tabler/icons-solidjs';
import { For, createEffect } from 'solid-js';
import styles from './Sidebar.module.scss';
import { css } from 'styled-system/css';

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
    // If it's the last control, clear it instead of removing
    if (controls.list.length === 1 && controls.list[0].id === id) {
      updateControl(id, {
        latex: '',
        graphChild: null, // This will trigger convert to Empty
        isError: false,
        errorMessage: '',
        vars: [],
        funcs: [],
      });
      return;
    }
    removeControl(id);
  };

  // Ensure there's always at least one control
  createEffect(() => {
    if (controls.list.length === 0) {
      handleAddControl();
    }
  });

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

      <div
        class={css({
          padding: '1rem',
          borderTop: '1px solid #e0e0e0',
        })}
      >
        <Button onClick={handleAddControl} style={{ width: '100%' }}>
          <IconPlus size={16} /> Add Expression
        </Button>
      </div>
    </div>
  );
}

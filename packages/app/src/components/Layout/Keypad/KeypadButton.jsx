import { IconArrowLeft, IconArrowRight, IconBackspace } from '@tabler/icons-solidjs';
import { Dynamic } from 'solid-js/web';
import { Show, createSignal, onCleanup } from 'solid-js';
import styles from './Keypad.module.scss';

const ICON_MAP = {
  backspace: IconBackspace,
  'arrow-left': IconArrowLeft,
  'arrow-right': IconArrowRight,
};

/**
 * Reusable keypad button component
 * Supports write, cmd, and func modes for MathQuill input
 */
export default function KeypadButton(props) {
  const [isHolding, setIsHolding] = createSignal(false);
  let holdTimer = null;
  let repeatInterval = null;

  const handleClick = () => {
    if (!props.mathField) return;

    const value = getActiveValue();
    if (!value) return;

    switch (props.type) {
      case 'write':
        props.mathField.write(value);
        break;
      case 'cmd':
        props.mathField.cmd(value);
        break;
      case 'func':
        props.mathField.write(value);
        props.mathField.cmd('(');
        break;
      case 'keystroke':
        props.mathField.keystroke(value);
        break;
    }

    props.onInput?.();
  };

  const getActiveValue = () => {
    // For shiftable buttons, use shifted value when shifted
    if (props.shiftable && props.isShifted) {
      return props.shiftValue || props.value;
    }
    // For double-shiftable buttons
    if (props.doubleShiftable) {
      if (props.isDoubleShifted) {
        return props.isShifted ? props.doubleShiftUpperValue : props.doubleShiftValue;
      }
      return props.isShifted ? props.shiftValue : props.value;
    }
    return props.value;
  };

  const getDisplayContent = () => {
    if (props.icon && ICON_MAP[props.icon]) {
      return <Dynamic component={ICON_MAP[props.icon]} size={18} />;
    }
    if (props.mathDisplay) {
      return <span class={styles.mathField}>{props.mathDisplay}</span>;
    }
    return <span>{props.label || props.value}</span>;
  };

  // Handle hold-to-repeat for backspace
  const handleMouseDown = () => {
    if (props.holdRepeat) {
      handleClick();
      setIsHolding(true);

      holdTimer = setTimeout(() => {
        if (isHolding()) {
          repeatInterval = setInterval(() => {
            handleClick();
          }, 120);
        }
      }, 400);
    }
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    if (repeatInterval) {
      clearInterval(repeatInterval);
      repeatInterval = null;
    }
  };

  onCleanup(() => {
    handleMouseUp();
  });

  return (
    <button
      type="button"
      class={styles.keypadButton}
      classList={{
        [styles.numBtn]: props.numBtn,
        [styles.nameBtn]: props.nameBtn,
        [styles.shiftable]: props.shiftable,
        [styles.doubleShiftable]: props.doubleShiftable,
        [styles.active]: props.isActive,
        [props.class]: !!props.class,
      }}
      onClick={props.holdRepeat ? undefined : handleClick}
      onMouseDown={props.holdRepeat ? handleMouseDown : undefined}
      onMouseUp={props.holdRepeat ? handleMouseUp : undefined}
      onMouseLeave={props.holdRepeat ? handleMouseUp : undefined}
      onTouchStart={props.holdRepeat ? handleMouseDown : undefined}
      onTouchEnd={props.holdRepeat ? handleMouseUp : undefined}
    >
      {getDisplayContent()}

      <Show when={props.shiftable && props.shiftLabel}>
        <span class={styles.shiftLabel}>{props.shiftLabel}</span>
      </Show>
    </button>
  );
}

/**
 * Spacer element for grid layouts
 */
export function KeypadSpacer() {
  return <div class={styles.takeSpace} />;
}

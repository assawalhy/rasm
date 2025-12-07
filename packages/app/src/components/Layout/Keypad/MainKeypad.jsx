import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsExchange,
  IconBackspace,
  IconCornerDownLeft,
} from '@tabler/icons-solidjs';
import { For } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import styles from './Keypad.module.scss';
import KeypadButton, { KeypadSpacer } from './KeypadButton';

/**
 * Main keypad with numbers, operators, and navigation
 * 5 rows x 9 columns layout
 */
export default function MainKeypad(props) {
  const ACTION_ICON_MAP = {
    backspace: IconBackspace,
    'exchange-alt': IconArrowsExchange,
    'arrow-left': IconArrowLeft,
    'arrow-right': IconArrowRight,
    'level-down-alt': IconCornerDownLeft,
  };

  // Row 1: Powers and brackets
  const row1 = [
    { type: 'write', value: '^2', mathDisplay: 'a²' },
    { spacer: true },
    { type: 'cmd', value: '^', shiftable: true, shiftValue: '_', mathDisplay: 'a^{...}', shiftLabel: 'a_{...}' },
    { type: 'cmd', value: '(', shiftable: true, shiftValue: '[', label: '(', shiftLabel: '[' },
    { type: 'cmd', value: ')', shiftable: true, shiftValue: ']', label: ')', shiftLabel: ']' },
    { type: 'cmd', value: '/', label: '÷' },
    { type: 'cmd', value: '\\sqrt', mathDisplay: '√a' },
    { spacer: true },
    { type: 'write', value: '\\lt', shiftable: true, shiftValue: '\\leq', label: '<', shiftLabel: '≤' },
  ];

  // Row 2: x, 7-8-9, multiply, nth root
  const row2 = [
    { type: 'write', value: 'x', nameBtn: true, mathDisplay: 'x' },
    { spacer: true },
    { type: 'write', value: '7', numBtn: true, label: '7' },
    { type: 'write', value: '8', numBtn: true, label: '8' },
    { type: 'write', value: '9', numBtn: true, label: '9' },
    { type: 'write', value: '\\cdot', label: '×' },
    { type: 'write', value: '\\sqrt[]{}', mathDisplay: 'ⁿ√a' },
    { spacer: true },
    { type: 'write', value: '>', shiftable: true, shiftValue: '\\geq', label: '>', shiftLabel: '≥' },
  ];

  // Row 3: y, 4-5-6, plus, e
  const row3 = [
    { type: 'write', value: 'y', nameBtn: true, mathDisplay: 'y' },
    { spacer: true },
    { type: 'write', value: '4', numBtn: true, label: '4' },
    { type: 'write', value: '5', numBtn: true, label: '5' },
    { type: 'write', value: '6', numBtn: true, label: '6' },
    { type: 'write', value: '+', label: '+' },
    { type: 'write', value: 'e', mathDisplay: 'e' },
    { spacer: true },
    { type: 'write', value: 'i', mathDisplay: 'i' },
  ];

  // Row 4: z, 1-2-3, minus, pi, backspace
  const row4 = [
    { type: 'write', value: 'z', nameBtn: true, label: 'z' },
    { spacer: true },
    { type: 'write', value: '1', numBtn: true, label: '1' },
    { type: 'write', value: '2', numBtn: true, label: '2' },
    { type: 'write', value: '3', numBtn: true, label: '3' },
    { type: 'write', value: '-', label: '-' },
    { type: 'write', value: '\\pi', nameBtn: true, mathDisplay: 'π' },
    { spacer: true },
    { type: 'keystroke', value: 'Backspace', icon: 'backspace', holdRepeat: true, class: 'backspace' },
  ];

  // Row 5: shift, ., 0, arrows, =, enter
  const row5 = [
    { action: 'shift', icon: 'exchange-alt', class: 'shift' },
    { spacer: true },
    { type: 'write', value: '.', shiftable: true, shiftValue: '\\pm', label: '.', shiftLabel: '±' },
    { type: 'write', value: '0', numBtn: true, label: '0' },
    { type: 'keystroke', value: 'Left', icon: 'arrow-left', class: 'go-left' },
    { type: 'keystroke', value: 'Right', icon: 'arrow-right', class: 'go-right' },
    { type: 'write', value: '=', label: '=', class: 'equal-sign' },
    { spacer: true },
    { action: 'enter', icon: 'level-down-alt', class: 'enter' },
  ];

  const rows = [row1, row2, row3, row4, row5];

  const handleButtonClick = (btn) => {
    if (btn.action === 'shift') {
      props.onShift?.();
    } else if (btn.action === 'enter') {
      props.onEnter?.();
    }
  };

  return (
    <div class={styles.mainKeypad} style="--columns-count: 9; --rows-count: 5;">
      <div class={styles.rows} style="--grid-template-columns: 1fr auto repeat(5, 1fr) auto 1fr;">
        <For each={rows}>
          {(row) => (
            <div class={styles.row}>
              <For each={row}>
                {(btn) => {
                  if (btn.spacer) {
                    return <KeypadSpacer />;
                  }
                  if (btn.action) {
                    return (
                      <button
                        type="button"
                        class={`${styles.keypadButton} ${styles[btn.class] || ''}`}
                        classList={{ [styles.active]: btn.action === 'shift' && props.isShifted }}
                        onClick={() => handleButtonClick(btn)}
                      >
                        <Dynamic component={ACTION_ICON_MAP[btn.icon]} size={20} />
                      </button>
                    );
                  }
                  return (
                    <KeypadButton
                      {...btn}
                      mathField={props.mathField}
                      isShifted={props.isShifted}
                      onInput={props.onInput}
                    />
                  );
                }}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

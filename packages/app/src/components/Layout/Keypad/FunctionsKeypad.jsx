import { IconArrowsExchange, IconArrowsShuffle } from '@tabler/icons-solidjs';
import { For } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import styles from './Keypad.module.scss';
import KeypadButton, { KeypadSpacer } from './KeypadButton';

/**
 * Functions keypad with trig, hyperbolic, log, and calculus functions
 */
export default function FunctionsKeypad(props) {
  const ACTION_ICON_MAP = {
    'exchange-alt': IconArrowsExchange,
    random: IconArrowsShuffle,
  };

  // Row 1: Trig functions
  const row1 = [
    {
      type: 'func',
      value: 'sin',
      label: 'sin',
      shiftable: true,
      shiftValue: 'sin^{-1}',
      shiftLabel: 'sin⁻¹',
      doubleShiftable: true,
      doubleShiftValue: 'csc',
      doubleShiftLabel: 'csc',
    },
    {
      type: 'func',
      value: 'cos',
      label: 'cos',
      shiftable: true,
      shiftValue: 'cos^{-1}',
      doubleShiftable: true,
      doubleShiftValue: 'sec',
    },
    {
      type: 'func',
      value: 'tan',
      label: 'tan',
      shiftable: true,
      shiftValue: 'tan^{-1}',
      doubleShiftable: true,
      doubleShiftValue: 'cot',
    },
    { spacer: true },
    { type: 'cmd', value: 'sum', label: '∑' },
  ];

  // Row 2: Hyperbolic functions
  const row2 = [
    {
      type: 'func',
      value: 'sinh',
      label: 'sinh',
      shiftable: true,
      shiftValue: 'sinh^{-1}',
      doubleShiftable: true,
      doubleShiftValue: 'csch',
    },
    {
      type: 'func',
      value: 'cosh',
      label: 'cosh',
      shiftable: true,
      shiftValue: 'cosh^{-1}',
      doubleShiftable: true,
      doubleShiftValue: 'sech',
    },
    {
      type: 'func',
      value: 'tanh',
      label: 'tanh',
      shiftable: true,
      shiftValue: 'tanh^{-1}',
      doubleShiftable: true,
      doubleShiftValue: 'coth',
    },
    { spacer: true },
    { type: 'write', value: '\\prod_{n=}^{ }', label: '∏' },
  ];

  // Row 3: Utility functions
  const row3 = [
    { type: 'func', value: 'floor', label: 'floor', shiftable: true, shiftValue: 'ceil', shiftLabel: 'ceil' },
    { type: 'func', value: 'gcd', label: 'gcd', shiftable: true, shiftValue: 'lcm', shiftLabel: 'lcm' },
    { type: 'func', value: 'round', label: 'round', shiftable: true, shiftValue: 'mod', shiftLabel: 'mod' },
    { spacer: true },
    { type: 'write', value: '!', label: '!' },
  ];

  // Row 4: Log functions
  const row4 = [
    { action: 'shift', icon: 'exchange-alt' },
    { type: 'func', value: '\\ln', label: 'ln' },
    { type: 'func', value: 'log', label: 'log' },
    { spacer: true },
    { type: 'cmd', value: 'int', mathDisplay: '∫' },
  ];

  // Row 5: Exp and derivatives
  const row5 = [
    { action: 'doubleShift', icon: 'random' },
    { type: 'write', value: 'e^{}', mathDisplay: 'e^{...}' },
    { type: 'func', value: '\\log_a', mathDisplay: 'log_a' },
    { spacer: true },
    { type: 'write', value: '\\frac{d}{dx}', mathDisplay: 'd/dx' },
  ];

  const rows = [row1, row2, row3, row4, row5];

  const handleActionClick = (action) => {
    if (action === 'shift') {
      props.onShift?.();
    } else if (action === 'doubleShift') {
      props.onDoubleShift?.();
    }
  };

  return (
    <div class={styles.functionsKeypad}>
      <div class={styles.rows} style="--grid-template-columns: repeat(3, 1fr) auto 1fr;">
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
                        class={`${styles.keypadButton} ${styles[btn.action === 'shift' ? 'shift' : 'doubleShift']}`}
                        classList={{
                          [styles.active]: btn.action === 'shift' ? props.isShifted : props.isDoubleShifted,
                        }}
                        onClick={() => handleActionClick(btn.action)}
                      >
                        <Dynamic component={ACTION_ICON_MAP[btn.icon]} size={18} />
                      </button>
                    );
                  }
                  return (
                    <KeypadButton
                      {...btn}
                      mathField={props.mathField}
                      isShifted={props.isShifted}
                      isDoubleShifted={props.isDoubleShifted}
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

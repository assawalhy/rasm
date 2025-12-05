import { For } from 'solid-js';
import styles from './Keypad.module.scss';
import KeypadButton, { KeypadSpacer } from './KeypadButton';

/**
 * Alpha keypad with QWERTY layout
 * Supports latin (a-z), uppercase (A-Z), and greek letters via double-shift
 */
export default function AlphaKeypad(props) {
  // Number row
  const numberRow = [
    { type: 'write', value: '1', numBtn: true },
    { type: 'write', value: '2', numBtn: true },
    { type: 'write', value: '3', numBtn: true },
    { type: 'write', value: '4', numBtn: true },
    { type: 'write', value: '5', numBtn: true },
    { type: 'write', value: '6', numBtn: true },
    { type: 'write', value: '7', numBtn: true },
    { type: 'write', value: '8', numBtn: true },
    { type: 'write', value: '9', numBtn: true },
    { type: 'write', value: '0', numBtn: true },
  ];

  // QWERTY rows with latin + greek variants
  const qwertyRow = [
    { latin: 'q', latinUpper: 'Q', greek: 'ϕ', greekUpper: 'Φ' },
    { latin: 'w', latinUpper: 'W', greek: 'ς', greekUpper: 'Σ' },
    { latin: 'e', latinUpper: 'E', greek: 'ε', greekUpper: 'Ε' },
    { latin: 'r', latinUpper: 'R', greek: 'ρ', greekUpper: 'Ρ' },
    { latin: 't', latinUpper: 'T', greek: 'τ', greekUpper: 'Τ' },
    { latin: 'y', latinUpper: 'Y', greek: 'υ', greekUpper: 'Υ' },
    { latin: 'u', latinUpper: 'U', greek: 'θ', greekUpper: 'Θ' },
    { latin: 'i', latinUpper: 'I', greek: 'ι', greekUpper: 'Ι' },
    { latin: 'o', latinUpper: 'O', greek: 'ο', greekUpper: 'Ο' },
    { latin: 'p', latinUpper: 'P', greek: 'π', greekUpper: 'Π' },
  ];

  const asdfRow = [
    { latin: 'a', latinUpper: 'A', greek: 'α', greekUpper: 'Α' },
    { latin: 's', latinUpper: 'S', greek: 'σ', greekUpper: 'Σ' },
    { latin: 'd', latinUpper: 'D', greek: 'δ', greekUpper: 'Δ' },
    { latin: 'f', latinUpper: 'F', greek: 'φ', greekUpper: 'Φ' },
    { latin: 'g', latinUpper: 'G', greek: 'γ', greekUpper: 'Γ' },
    { latin: 'h', latinUpper: 'H', greek: 'η', greekUpper: 'Η' },
    { latin: 'j', latinUpper: 'J', greek: 'ξ', greekUpper: 'Ξ' },
    { latin: 'k', latinUpper: 'K', greek: 'κ', greekUpper: 'Κ' },
    { latin: 'l', latinUpper: 'L', greek: 'λ', greekUpper: 'Λ' },
  ];

  const zxcvRow = [
    { latin: 'z', latinUpper: 'Z', greek: 'ζ', greekUpper: 'Ζ' },
    { latin: 'x', latinUpper: 'X', greek: 'χ', greekUpper: 'Χ' },
    { latin: 'c', latinUpper: 'C', greek: 'ψ', greekUpper: 'Ψ' },
    { latin: 'v', latinUpper: 'V', greek: 'ω', greekUpper: 'Ω' },
    { latin: 'b', latinUpper: 'B', greek: 'β', greekUpper: 'Β' },
    { latin: 'n', latinUpper: 'N', greek: 'ν', greekUpper: 'Ν' },
    { latin: 'm', latinUpper: 'M', greek: 'μ', greekUpper: 'Μ' },
  ];

  const getLetterValue = (letter) => {
    if (props.isDoubleShifted) {
      return props.isShifted ? letter.greekUpper : letter.greek;
    }
    return props.isShifted ? letter.latinUpper : letter.latin;
  };

  const getLetterDisplay = (letter) => {
    return getLetterValue(letter);
  };

  return (
    <div class={styles.alphaKeypad} style="--columns-count: 10; --rows-count: 5;">
      <div class={styles.rows}>
        {/* Number row */}
        <div class={styles.row}>
          <For each={numberRow}>
            {(btn) => (
              <KeypadButton
                type="write"
                value={btn.value}
                label={btn.value}
                numBtn={btn.numBtn}
                mathField={props.mathField}
                onInput={props.onInput}
              />
            )}
          </For>
        </div>

        {/* QWERTY row */}
        <div class={styles.row}>
          <For each={qwertyRow}>
            {(letter) => (
              <KeypadButton
                type="write"
                value={getLetterValue(letter)}
                label={getLetterDisplay(letter)}
                doubleShiftable
                mathField={props.mathField}
                isShifted={props.isShifted}
                isDoubleShifted={props.isDoubleShifted}
                onInput={props.onInput}
              />
            )}
          </For>
        </div>

        {/* ASDF row (with padding) */}
        <div class={styles.row} style="--grid-template-columns: 0.5fr repeat(9, 1fr) 0.5fr;">
          <KeypadSpacer />
          <For each={asdfRow}>
            {(letter) => (
              <KeypadButton
                type="write"
                value={getLetterValue(letter)}
                label={getLetterDisplay(letter)}
                doubleShiftable
                mathField={props.mathField}
                isShifted={props.isShifted}
                isDoubleShifted={props.isDoubleShifted}
                onInput={props.onInput}
              />
            )}
          </For>
          <KeypadSpacer />
        </div>

        {/* ZXCV row (with shift and backspace) */}
        <div class={styles.row} style="--grid-template-columns: 1.5fr repeat(7, 1fr) 1.5fr;">
          <div>
            <button
              type="button"
              class={`${styles.keypadButton} ${styles.shift}`}
              classList={{ [styles.active]: props.isShifted }}
              onClick={props.onShift}
            >
              <i class="fas fa-exchange-alt" />
            </button>
          </div>
          <For each={zxcvRow}>
            {(letter) => (
              <KeypadButton
                type="write"
                value={getLetterValue(letter)}
                label={getLetterDisplay(letter)}
                doubleShiftable
                mathField={props.mathField}
                isShifted={props.isShifted}
                isDoubleShifted={props.isDoubleShifted}
                onInput={props.onInput}
              />
            )}
          </For>
          <div>
            <KeypadButton
              type="keystroke"
              value="Backspace"
              icon="backspace"
              holdRepeat
              mathField={props.mathField}
              onInput={props.onInput}
            />
          </div>
        </div>

        {/* Bottom row: double-shift, arrows, space, enter */}
        <div class={styles.row} style="--grid-template-columns: repeat(7, 1fr);">
          <button
            type="button"
            class={`${styles.keypadButton} ${styles.doubleShift}`}
            classList={{ [styles.active]: props.isDoubleShifted }}
            onClick={props.onDoubleShift}
          >
            <i class="fas fa-random" />
          </button>
          <KeypadButton type="keystroke" value="Down" icon="arrow-down" mathField={props.mathField} />
          <KeypadButton type="keystroke" value="Up" icon="arrow-up" mathField={props.mathField} />
          <KeypadButton
            type="write"
            value="\\ "
            label="space"
            class="space"
            mathField={props.mathField}
            onInput={props.onInput}
          />
          <KeypadButton type="keystroke" value="Left" icon="arrow-left" mathField={props.mathField} />
          <KeypadButton type="keystroke" value="Right" icon="arrow-right" mathField={props.mathField} />
          <button type="button" class={`${styles.keypadButton} ${styles.enter}`} onClick={props.onEnter}>
            <i class="fas fa-level-down-alt" />
          </button>
        </div>
      </div>
    </div>
  );
}

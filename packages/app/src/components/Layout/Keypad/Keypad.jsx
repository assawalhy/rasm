import Tabs, { Tab } from '@components/UI/Tabs';
import { addControl, controls, focusControl } from '@stores/controlsStore';
import { createEffect, createSignal } from 'solid-js';
import AlphaKeypad from './AlphaKeypad';
import FunctionsKeypad from './FunctionsKeypad';
import styles from './Keypad.module.scss';
import MainKeypad from './MainKeypad';

/**
 * Mathematical keypad component with Main, Alpha, and Functions tabs
 */
export default function Keypad() {
  const [isVisible, setIsVisible] = createSignal(false);
  const [isShifted, setIsShifted] = createSignal(false);
  const [isShiftLocked, setIsShiftLocked] = createSignal(false);
  const [isDoubleShifted, setIsDoubleShifted] = createSignal(false);
  const [mathField, setMathField] = createSignal(null);

  // Update mathField reference when focused control changes
  createEffect(() => {
    const focusedId = controls.focused;
    if (focusedId) {
      // The mathField will be set by the ChildControl component
      // For now, we'll access it through the store's keypadSettings
      setMathField(controls.keypadSettings.mathField);
    }
  });

  const handleShift = () => {
    if (isShifted() && !isShiftLocked()) {
      // Second click: lock shift
      setIsShiftLocked(true);
    } else if (isShiftLocked()) {
      // Third click: unlock and turn off
      setIsShiftLocked(false);
      setIsShifted(false);
    } else {
      // First click: activate shift
      setIsShifted(true);
    }
  };

  const handleDoubleShift = () => {
    setIsDoubleShifted(!isDoubleShifted());
  };

  const handleInput = () => {
    // After input, turn off shift if not locked
    if (isShifted() && !isShiftLocked()) {
      setIsShifted(false);
    }
  };

  const handleEnter = () => {
    // Add new control after current focused control
    const focusedControl = controls.list.find((c) => c.id === controls.focused);
    if (focusedControl) {
      const currentIndex = controls.list.indexOf(focusedControl);
      const newControl = addControl({}, currentIndex + 1);
      focusControl(newControl.id);
    } else {
      const newControl = addControl();
      focusControl(newControl.id);
    }
  };

  return (
    <div class={styles.keypad} classList={{ [styles.visible]: isVisible() }}>
      <button type="button" class={styles.toggleButton} onClick={() => setIsVisible(!isVisible())}>
        <i class={`fas fa-${isVisible() ? 'chevron-down' : 'keyboard'}`} />
      </button>

      <div class={styles.keypadContent}>
        <Tabs defaultTab={0}>
          <Tab label="Main">
            <MainKeypad
              mathField={mathField()}
              isShifted={isShifted()}
              onShift={handleShift}
              onInput={handleInput}
              onEnter={handleEnter}
            />
          </Tab>
          <Tab label="Alpha">
            <AlphaKeypad
              mathField={mathField()}
              isShifted={isShifted()}
              isDoubleShifted={isDoubleShifted()}
              onShift={handleShift}
              onDoubleShift={handleDoubleShift}
              onInput={handleInput}
              onEnter={handleEnter}
            />
          </Tab>
          <Tab label="Functions">
            <FunctionsKeypad
              mathField={mathField()}
              isShifted={isShifted()}
              isDoubleShifted={isDoubleShifted()}
              onShift={handleShift}
              onDoubleShift={handleDoubleShift}
              onInput={handleInput}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

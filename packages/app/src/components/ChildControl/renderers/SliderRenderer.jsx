import { createEffect, createSignal } from 'solid-js';
import styles from './SliderRenderer.module.scss';

/**
 * SliderRenderer component - replaces class-based SliderRenderer
 */
export default function SliderRenderer(props) {
  const [value, setValue] = createSignal(props.graphChild?.getValue() || 0);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [min, setMin] = createSignal(-5);
  const [max, setMax] = createSignal(5);
  const [step, setStep] = createSignal(0.01);
  const [showController, setShowController] = createSignal(false);

  let minFieldRef;
  let maxFieldRef;
  let stepFieldRef;

  createEffect(() => {
    // Sync value with graph child
    if (props.graphChild) {
      setValue(props.graphChild.getValue());
    }
  });

  const handleSliderChange = (e) => {
    const newValue = Number.parseFloat(e.target.value);
    setValue(newValue);

    if (props.graphChild) {
      props.graphChild.setValue(newValue);
    }
  };

  const handleSliderInput = (e) => {
    const newValue = Number.parseFloat(e.target.value);
    setValue(newValue);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying());
    // Integrate with slidersAutoplay store
  };

  const handleMinChange = (latex) => {
    try {
      const value = Number.parseFloat(latex);
      if (!isNaN(value) && Number.isFinite(value)) {
        setMin(value);
      }
    } catch (e) {
      console.error('Invalid min value:', e);
    }
  };

  const handleMaxChange = (latex) => {
    try {
      const value = Number.parseFloat(latex);
      if (!isNaN(value) && Number.isFinite(value)) {
        setMax(value);
      }
    } catch (e) {
      console.error('Invalid max value:', e);
    }
  };

  const handleStepChange = (latex) => {
    try {
      const value = Number.parseFloat(latex);
      if (!isNaN(value) && Number.isFinite(value) && value > 0) {
        setStep(value);
      }
    } catch (e) {
      console.error('Invalid step value:', e);
    }
  };

  return (
    <div class={styles.sliderOuter} classList={{ [styles.play]: isPlaying() }}>
      <div class={styles.rangeContainer}>
        <button
          type="button"
          class={styles.controllerToggle}
          onClick={() => setShowController(!showController())}
          title="Toggle Controls"
        >
          <i class={`fas fa-angle-${showController() ? 'up' : 'down'}`} />
        </button>

        <input
          type="range"
          class={styles.slider}
          min={min()}
          max={max()}
          step={step()}
          value={value()}
          onInput={handleSliderInput}
          onChange={handleSliderChange}
        />

        <button type="button" class={styles.playPause} onClick={togglePlay} title={isPlaying() ? 'Pause' : 'Play'}>
          <i class={`fas fa-${isPlaying() ? 'pause' : 'play'}`} />
        </button>
      </div>

      {showController() && (
        <div class={styles.sliderController}>
          <div class={styles.controlRow}>
            <label>min:</label>
            <span class={styles.controlValue}>{min()}</span>
          </div>
          <div class={styles.controlRow}>
            <label>max:</label>
            <span class={styles.controlValue}>{max()}</span>
          </div>
          <div class={styles.controlRow}>
            <label>step:</label>
            <span class={styles.controlValue}>{step()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

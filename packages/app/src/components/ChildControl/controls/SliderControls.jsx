import { createEffect, createSignal, onCleanup } from 'solid-js';
import { registerSlider, unregisterSlider } from '@stores/animationStore';
import styles from './SliderControls.module.scss';
import { requestRedraw } from '@stores/sketchStore';
import { IconChevronDown, IconChevronUp, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-solidjs';

/**
 * SliderControls component - controls for Slider graph child
 */
export default function SliderControls(props) {
  const [value, setValue] = createSignal(props.graphChild?.getValue() || 0);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [min, setMin] = createSignal(-5);
  const [max, setMax] = createSignal(5);
  const [step, setStep] = createSignal(0.01);
  const [showController, setShowController] = createSignal(false);
  const [direction, setDirection] = createSignal(1);

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
      requestRedraw();
    }
  };

  const handleSliderInput = (e) => {
    const newValue = Number.parseFloat(e.target.value);
    setValue(newValue);
    if (props.graphChild) {
      props.graphChild.setValue(newValue);
      requestRedraw();
    }
  };

  const updateAnimation = () => {
    let newVal = value() + step() * direction();

    if (newVal >= max()) {
      newVal = max();
      setDirection(-1);
    } else if (newVal <= min()) {
      newVal = min();
      setDirection(1);
    }

    setValue(newVal);
    if (props.graphChild) {
      props.graphChild.setValue(newVal);
    }
  };

  const togglePlay = () => {
    const playing = !isPlaying();
    setIsPlaying(playing);

    if (props.graphChild?.id) {
      if (playing) {
        registerSlider(props.graphChild.id, updateAnimation);
      } else {
        unregisterSlider(props.graphChild.id);
      }
    }
  };

  onCleanup(() => {
    if (props.graphChild?.id) {
      unregisterSlider(props.graphChild.id);
    }
  });

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
          {showController() ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
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
          {isPlaying() ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
        </button>
      </div>

      {showController() && (
        <div class={styles.sliderController}>
          <div class={styles.controlRow}>
            <span>min:</span>
            <span data-math={true} class={styles.controlValue}>
              {min()}
            </span>
          </div>
          <div class={styles.controlRow}>
            <span>max:</span>
            <span data-math={true} class={styles.controlValue}>
              {max()}
            </span>
          </div>
          <div class={styles.controlRow}>
            <span>step:</span>
            <span data-math={true} class={styles.controlValue}>
              {step()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

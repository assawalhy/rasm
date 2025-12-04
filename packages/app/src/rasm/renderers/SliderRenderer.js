import BaseRenderer from './BaseRenderer.js';
import { getJSfunction } from '../../core/global.js';
import { slidersAutoplay } from '../slidersController.js';
import sketch from '../sketch.js';

/**
 * Renderer for Slider graph children (interactive sliders with controls)
 * This is the most complex renderer as it handles:
 * - Slider UI with play/pause
 * - Min/max/step controls
 * - Animation and autoplay
 * - Value change propagation to graph child and sketch
 */
export default class SliderRenderer extends BaseRenderer {
  invokeOnchange = true;
  /**
   * Set up handlers for slider value changes.
   * This is called after the renderer is created to establish the
   * connection between slider changes and graph child updates.
   */
  setupHandlers() {
    // Handler for when slider value changes (programmatically or by user)
    this.graphChild.handlers.onchange = ({ updateSliderElement = true, updateSketch = true } = {}) => {
      // Update the slider UI element if needed
      if (updateSliderElement) {
        this.elements.slider.value = this.graphChild.getValue();
      }

      // Update the sketch to reflect the new value
      if (updateSketch) {
        sketch.update({ redraw: true, redrawCoors: false });
      }
    };
  }

  render(container) {
    const mainContainer = this.control.elt.querySelector('.main');

    // Create slider UI
    const sliderOuter = this.createElement(`
      <div class='slider-outer special-elt'>
        <div class='range-container'>
          <span class='slider-controller-toggle'>
            <i class="fas fa-angle-right right"></i>
          </span>
          <input type=range class=slider min=-5 max=5 step=0.01 />
          <span class='play-pause'>
            <svg role="img" width=15 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path class="path"></path>
            </svg>
          </span>
        </div>
        <div class='slider-controller'>
          <label>min</label>:<span class="math-field min">-5</span>
          <label>max</label>:<span class="math-field max">5</span>
          <label>step</label>:<span class="math-field step">0.01</span>
        </div>
      </div>
    `);

    mainContainer.appendChild(sliderOuter);
    this.elements.sliderOuter = sliderOuter;
    this.elements.slider = sliderOuter.querySelector('.slider');

    this.setupPlayPause();
    this.setupSliderControls();
    this.setupSliderEvents();
    this.setupControllerToggle();

    this.update();
  }

  setupPlayPause() {
    const playPause = this.elements.sliderOuter.querySelector('.play-pause');

    if (playPause) {
      this.addEventListener(playPause, 'click', () => {
        this.elements.sliderOuter.classList.toggle('play');

        if (this.elements.sliderOuter.classList.contains('play')) {
          slidersAutoplay.push(this.control);
        } else {
          slidersAutoplay.pop(this.control);
        }
      });
    }
  }

  setupSliderControls() {
    const slider = this.elements.slider;

    // Create MathQuill fields for min/max/step
    const options = {
      min: MQ.MathField(
        this.elements.sliderOuter.querySelector('.slider-controller .math-field.min'),
        {
          handlers: {
            edit: () => {
              this.pauseSlider();
              slider.min = getJSfunction(options.min.latex())();
            },
          },
        }
      ),
      max: MQ.MathField(
        this.elements.sliderOuter.querySelector('.slider-controller .math-field.max'),
        {
          handlers: {
            edit: () => {
              this.pauseSlider();
              slider.max = getJSfunction(options.max.latex())();
            },
          },
        }
      ),
      step: MQ.MathField(
        this.elements.sliderOuter.querySelector('.slider-controller .math-field.step'),
        {
          handlers: {
            edit: () => {
              this.pauseSlider();
              slider.step = getJSfunction(options.step.latex())();
            },
          },
        }
      ),
      dir: 'oscillate',
      speed: 50,
      sliderDirection: 1,
    };

    // Store slider properties for compatibility
    this.options = options;
  }

  setupSliderEvents() {
    const slider = this.elements.slider;

    // Custom onchange event
    this.addEventListener(slider, 'onchange', (event) => {
      if (this.invokeOnchange) {
        const handlerParams = event.handlerParams || [];
        this.graphChild.setValue(Number.parseFloat(slider.value), handlerParams);
        this.control.setLatex(`${this.graphChild.id} = ${slider.value}`, true);
      }
    });

    // Mouse/touch move
    const handleMouseMove = () => {
      if (slider.ismousedown) {
        slider.dispatchEvent(
          new CustomEvent('onchange', {
            handlerParams: [{ updateSliderElement: false }]
          })
        );
      }
    };
    this.addEventListener(slider, 'mousemove', handleMouseMove);
    this.addEventListener(slider, 'touchmove', handleMouseMove);

    // Mouse/touch down
    const handleMouseDown = () => {
      this.pauseSlider();
      slider.ismousedown = true;
    };
    this.addEventListener(slider, 'mousedown', handleMouseDown);
    this.addEventListener(slider, 'touchstart', handleMouseDown);

    // Mouse/touch up
    const handleMouseUp = () => {
      slider.dispatchEvent(
        new CustomEvent('onchange', {
          handlerParams: [{ updateSliderElement: false }]
        })
      );
      slider.ismousedown = false;
    };
    this.addEventListener(slider, 'mouseup', handleMouseUp);
    this.addEventListener(slider, 'touchend', handleMouseUp);
  }

  setupControllerToggle() {
    const toggle = this.elements.sliderOuter.querySelector('.slider-controller-toggle');

    if (toggle) {
      this.addEventListener(toggle, 'click', () => {
        this.elements.sliderOuter.classList.toggle('controller-opended');
      });
    }
  }

  update() {
    const slider = this.elements.slider;
    const value = this.graphChild.getValue();

    // Update min/max to accommodate current value
    this.options.min.latex(
      Math.min(Number.parseFloat(slider.min), Number.parseFloat(value))
    );
    this.options.max.latex(
      Math.max(Number.parseFloat(slider.max), Number.parseFloat(value))
    );

    // Update slider value without triggering onchange
    this.invokeOnchange = false;
    slider.value = value;
    this.invokeOnchange = true;
  }

  pauseSlider() {
    if (this.elements.sliderOuter.classList.contains('play')) {
      const playPause = this.elements.sliderOuter.querySelector('.play-pause');
      if (playPause) playPause.click();
    }
  }

  cleanup() {
    // Pause slider before cleanup
    this.pauseSlider();

    // Call parent cleanup
    super.cleanup();
  }
}

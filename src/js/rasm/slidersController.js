import sketch from './sketch.js';

export const slidersAutoplay = {
  workingSliders: [],
  interval: 0,
  status: 'all-stoped',

  /**
   * @param {ChildControl} sliderControl
   */
  push: function (sliderControl) {
    const slider = sliderControl.sliderProps.slider;
    const attrs = sliderControl.sliderProps.attrs;
    const sliderConfig = {
      min: Number.parseFloat(slider.min),
      max: Number.parseFloat(slider.max),
      step: Number.parseFloat(slider.step),
      value: sliderControl.graphChild.getValue(),
    };
    const stepConfig = {
      current: Math.round((sliderConfig.value - sliderConfig.min) / sliderConfig.step),
      prev: Math.round((sliderConfig.value - sliderConfig.min) / sliderConfig.step),
      stepsCount: Math.round((sliderConfig.max - sliderConfig.min) / sliderConfig.step),
    };

    this.workingSliders.push({ sliderControl, stepConfig, sliderConfig, attrs, slider });

    if (this.status === 'all-stoped') {
      this.status = 'working';
      this.startSlidersInterval();
    }
  },

  /**
   * @param {ChildControl} sliderControl
   */
  pop: function (sliderControl) {
    for (let i = 0; i < this.workingSliders.length; i++) {
      if (sliderControl === this.workingSliders[i].sliderControl) {
        this.workingSliders.splice(i, 1);
      }
    }
    if (this.workingSliders.length === 0) {
      this.status = 'all-stoped';
      clearInterval(this.interval);
    }
  },

  startSlidersInterval: function () {
    const intervalSleepDur = 15; /// in ms
    // let setNew = true;
    // let times = 0;
    this.interval = setInterval(() => {
      // updating all working slliders
      for (const { attrs, sliderConfig, stepConfig, slider } of this.workingSliders) {
        stepConfig.current += ((attrs.speed / 100 * attrs.sliderDirection)) * (intervalSleepDur / 1000) * stepConfig.stepsCount;
        if (Math.abs(stepConfig.current - stepConfig.prev) >= 1) {
          let value;
          switch (attrs.dir) {
            case 'oscillate': {
              value = sliderConfig.min + Math.round(stepConfig.current) * sliderConfig.step;
              if (stepConfig.current < 0 || stepConfig.current > stepConfig.stepsCount) attrs.sliderDirection *= -1;
              break;
            }
            case 'forwards': {
              value = sliderConfig.min + stepConfig.current * sliderConfig.step;
              if (stepConfig.current > sliderConfig.stepsCount) stepConfig.current = 0;
              break;
            }
            case 'backwards': {
              value = sliderConfig.min + stepConfig.current * sliderConfig.step;
              if (stepConfig.current < 0) stepConfig.current = sliderConfig.stepsCount;
              break;
            }
          }
          slider.value = value;
          stepConfig.prev = value;
          slider.dispatchEvent(new CustomEvent('onchange', { handlerParams: [{ updateSliderElement: true, updateSketch: false }] }));
        }
      }
      sketch.update({ redraw: true, redrawCoors: false }); // draw all slider changes at once
    }, intervalSleepDur);
  },
};


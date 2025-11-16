import ChildControl from './ChildControl.js';
import sketch from './sketch.js';

const canvasParent = sketch.canvas.parent;
const math = MathPackage.Core;

//#region variables
export const subTools = {
  details: SUI.TempMessege({
    layer: false,
    toolsbar: true,
    onhoverFix: true,
    position: { bottom: 20, left: 20 },
    duration: 2500, // to make it fixed
    content: '<p style="background: green; color:white;">There is no god but Allah',
    parent: document.querySelector('#canvas-parent').parentElement,
  }),
};
export const mouse = { x: undefined, y: undefined };

export const keypadSettings = {
  backspaceInterval: undefined,
  mouseDownForInterval: false,
  showHideKeyBtn: document.querySelector('.sh-keypad'),
  mathField: document.querySelector('.script'),
};

export const sidebar = document.querySelector('.sidebar-container');

//#endregion

//#region methods

export function updateObjsOrder() {
  const objs = document.querySelectorAll('.controls li');
  let order = 1;
  for (const obj of objs) {
    obj.setAttribute('index', order - 1);
    obj.querySelector('.order').textContent = order++;
  }
}

export function addControl(input, index = 'last', autoFocus = true) {
  let control = input;
  if ((typeof input).toLowerCase() === 'string') {
    control = new ChildControl();
    control.mathField.latex(input);
  }
  const controls = document.querySelector('.controls');
  const resolvedIndex = math.isNumeric(index) && index > controls.childElementCount - 1 ? 'last' : index;
  const i = resolvedIndex === 'last' ? controls.childElementCount - 1 : resolvedIndex;
  if (i > -1 && resolvedIndex !== 'last') {
    control.elt.querySelector('.order').textContent = i + 1;
    controls.insertBefore(control.elt, controls.children[i]);
    updateObjsOrder();
  } else {
    control.elt.setAttribute('index', controls.childElementCount);
    control.elt.querySelector('.order').textContent = controls.childElementCount + 1;
    controls.appendChild(control.elt);
  }
  if (autoFocus) control.focus();
}

export function removeControl(control) {
  if (control === keypadSettings.focusedControl) {
    const alter = control.elt.previousElementSibling || control.elt.nextElementSibling;
    if (alter) {
      sketch.children.get(alter.getAttribute('id')).control.focus();
    }
  }
  control.elt.remove();
  const controls = document.querySelector('.controls');
  const newControlBtn = controls.parentElement.querySelector('#add-new-control');
  if (controls.childElementCount === 0) {
    newControlBtn.classList.add('animate-shake');
    controls.parentElement.classList.add('blink-error');
    setTimeout(() => {
      newControlBtn.classList.remove('animate-shake');
      controls.parentElement.classList.remove('blink-error');
      addControl(new ChildControl());
    }, 400);
  }
}

export function addTOsketch(child, controlIndex = 'last' /* the index */) {
  if ((controlIndex || controlIndex === 0) && !child.control) {
    const control = new ChildControl(child);
    addControl(control, controlIndex);
  }
  sketch.appendChild(child);
}

export function resize(setContainment = true) {
  document.body.style.height = `${window.innerHeight}px`;

  checkSM();

  sketch.canvas.resize(canvasParent.clientWidth, canvasParent.clientHeight);
  sketch.childrenCanvas.resize(canvasParent.clientWidth, canvasParent.clientHeight);

  sketch.gs.transform.invokeOnchange = false;

  sketch.gs.width = canvasParent.clientWidth;
  sketch.gs.height = canvasParent.clientHeight;

  const vp = sketch.gs.viewport;
  sketch.gs.transform.onchange(true);
  // if (angles.minAngle(new vector(1, 0), vector.fromAngle(sketch.gs.transform.xAngle)).toFixed(3) === (0).toFixed(3) && angles.minAngle(new vector(1, 0), vector.fromAngle(sketch.gs.transform.yAngle)).toFixed(3) === (Math.PI / 2).toFixed(3)) {
  sketch.gs.transform.transformOrigin = undefined;
  sketch.gs.transform.setViewport(vp, true);
  sketch.gs.transform.invokeOnchange = true;
  sketch.gs.transform.onchange();
  // }

  if (setContainment) {
    $('.resizer', sidebar).draggable('option', 'containment', getContainment(sidebar));
    // .css({ left: document.querySelector('.sidebar-container').clientWidth + 'px' });
  }

  sketch.update();
  resize.prevSize = { width: window.innerWidth, height: window.innerHeight };
}
export function checkSM() {
  if (window.innerWidth <= 600 && resize.prevSize.width > 600) {
    /// changing the element layout
    document.body.querySelector('.app-container').classList.remove('large-screen');
    document.body.querySelector('.app-container').classList.add('small-screen');
  } else if (window.innerWidth > 600 && resize.prevSize.width <= 600) {
    /// changing the element layout
    document.body.querySelector('.app-container').classList.add('large-screen');
    document.body.querySelector('.app-container').classList.remove('small-screen');
  }
}
checkSM.prevSize = { width: window.innerWidth, height: window.innerHeight };

export function getContainment(elt) {
  const sidebarStyle = window.getComputedStyle(elt);
  const min = Number.parseInt(sidebarStyle.minWidth.replace('px', ''));
  const max = Number.parseInt(sidebarStyle.maxWidth.replace('px', ''));
  /// this is for solving the problem when the max width 30%vw is lower than the min width 300px,
  ///   - which cuase a problem with the position (style.left) of the resizer.
  if (min > max) {
    return [min, 0, min, Number.parseInt(sidebarStyle.height.replace('px', ''))];
  }
  return [min, 0, max, Number.parseInt(sidebarStyle.height.replace('px', ''))];
}
export function genRandomName() {
  const num = 0;
  /// randomNameNum is here to avoid getting the same random name if the code is implemented so fast

  return (Date.now() + genRandomName.randomNameNum++).toString(36).replace(/\d/g, (num) => {
    return String.fromCharCode(97 + Number.parseInt(num));
  });
}
genRandomName.randomNameNum = 0;

export function hassClass(elt, c) {
  for (const _c of elt.classList) {
    if (c === _c) return true;
  }
  return false;
}

export const slidersController = {
  workingSliders: [],
  interval: 0,
  status: 'all-stoped',

  /**
   * @param {ChildControl} sliderControl
   */
  push: function (sliderControl) {
    const $slider = sliderControl.sliderProps.$slider;
    const slider = $slider[0];
    const attrs = sliderControl.sliderProps.attrs;
    const sliderConfig = {
      min: Number.parseFloat(slider.min),
      max: Number.parseFloat(slider.max),
      step: Number.parseFloat(slider.step),
      value: sliderControl.graphChild.getValue(),
    };
    const stepConfig = {
      current: (sliderConfig.value - sliderConfig.min) / sliderConfig.step,
      prev: (sliderConfig.value - sliderConfig.min) / sliderConfig.step,
      max: (sliderConfig.max - sliderConfig.min) / sliderConfig.step,
    };

    this.workingSliders.push({ sliderControl, stepConfig, sliderConfig, attrs, $slider });

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
      // if (setNew) {
      //    setNew = false;
      //    setTimeout(() => {
      //       console.log((times * 15), 'fps');
      //       times = 0;
      //       setNew = true;
      //    }, 1000);
      // }
      // times++;
      // updating all working slliders
      for (const slider of this.workingSliders) {
        const stepConfig = slider.stepConfig;
        const sliderConfig = slider.sliderConfig;
        const $slider = slider.$slider;
        //#region stepConfig.current
        /**
         * the attrs.speed is in (step per second),
         * so let devide it bty 1000 to get the speed in (ms),
         * then multiply by the duration of sleeping of the interval,
         * with this computation, the slider will give an illusion of the given speed,
         * moreover, users eyes won't recognize what is happening.
         */
        stepConfig.current += ((slider.attrs.speed * slider.attrs.speedModifier) / 1000) * intervalSleepDur;
        //#endregion
        if (Math.abs(stepConfig.current - stepConfig.prev) > 1) {
          switch (slider.attrs.dir) {
            case 'oscillate': {
              const value = sliderConfig.min + stepConfig.current * sliderConfig.step;
              if (stepConfig.current < 0 || stepConfig.current > stepConfig.max) slider.attrs.speedModifier *= -1;
              else {
                $slider[0].value = value;
                $slider.trigger('change', true, false);
              }
              break;
            }
            case 'forwards': {
              const value = sliderConfig.min + stepConfig.current * sliderConfig.step;
              if (stepConfig.current > stepConfig.max) stepConfig.current = 0;
              else {
                $slider[0].value = value;
                $slider.trigger('change', true, false);
              }
              break;
            }
            case 'backwards': {
              const value = sliderConfig.min + stepConfig.current * sliderConfig.step;
              if (stepConfig.current < 0) stepConfig.current = stepConfig.max;
              else {
                $slider[0].value = value;
                $slider.trigger('change', true, false);
              }
              break;
            }
          }
          stepConfig.prev = stepConfig.current;
        }
      }
      sketch.update(true, false);
    }, intervalSleepDur);
  },
};

//#endregion

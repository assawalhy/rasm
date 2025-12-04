import { UndefError } from '../core/Errors/index.js';
import { Empty, EvalExpr, Func, Slider, Variable, Xfunction } from '../core/GraphChildren/index.js';
import { getJSfunction } from '../core/global.js';
import { addControl, keypadSettings, removeControl } from './global.js';
import sketch from './sketch.js';
import { slidersAutoplay } from './slidersController.js';
import { parser, Core } from "@rasm/math";
import { Node } from "@rasm/magical-parser";

export default class ChildControl {
  constructor(graphChild) {
    this.elt = document.createElement('div');
    this.elt.innerHTML = `
      <li class="control" id="${this.id}">
         <div class="side-status" cancel-move>
            <div class="order-container">
               <span class='order'>12</span>
            </div>
         </div>
         <div class='main' cancel-move>
            <div class=script-container>
               <span type="text" class="script"></span>
            </div>
         </div>
         <div class="side-ctrl">
            <button class="closebtn-2 remove" cancel-move><div class="inner"></div></button>
            <span class="move">
               <div>
                  <span>..</span>
                  <span>..</span>
                  <span>..</span>
               </div>
            </span>
         </div>
      </li>
      `;
    this.elt = this.elt.childNodes[1];

    this.status = 'ready';
    this.graphChild = graphChild || new Empty({ sketch, control: this });
    this.__updateElts(null, this.graphChild);

    this.setEvents();
  }

  get id() {
    return this._id;
  }

  set id(newid) {
    this._id = newid;
    this.elt.id = newid;
  }

  get graphChild() {
    return this._graphChild;
  }

  set graphChild(value) {
    if (value instanceof EvalExpr) {
      value.handlers.onupdate = () => {
        this.__updateEvalExpr();
      };
    } else if (value instanceof Slider) {
      value.handlers.onchange = ({ updateSliderElement = true, updateSketch = true } = {}) => {
        if (updateSliderElement && this.sliderProps) this.sliderProps.slider.value = this._graphChild.getValue();
        if (updateSketch) sketch.update({ redraw: true, redrawCoors: false });
      };
    }

    this._graphChild = value;
    this.id = value.id;
  }

  setEvents() {
    const scriptELT = this.elt.querySelector('.script');
    this.removeELT = this.elt.querySelector('.remove');
    this.orderELT = this.elt.querySelector('.order');

    //#region math, script field
    const mathField = MQ.MathField(scriptELT, {
      handlers: {
        edit: () => {
          this.update(mathField.latex());
        },

        enter: () => {
          this.enter();
        },
      },
    });
    this.mathField = mathField;
    //#endregion

    this.elt.querySelector('.main').addEventListener('focusin', (e) => {
      this.focus(false);
    });

    this.elt.querySelector('.main').addEventListener('focusout', (e) => {
      this.blur(false);
    });

    this.removeELT.addEventListener('click', (e) => {
      this.remove();
    });
  }

  update(latex) {
    if (!this.disableHandling) {
      if (this.status === 'ready') {
        // pause running slider
        if (this._graphChild instanceof Slider) {
          const sliderOuter = this.elt.querySelector('.slider-outer');
          if (sliderOuter?.classList.contains('play')) {
            this.elt.querySelector('.play-pause')?.click();
          }
        }
        this.status = 'updating';
        this._graphChild.remove();
        this.id = undefined;
        try {
          const prev = this._graphChild;
          if (latex === '') {
            this.parsedScript = new Node('');
            this.graphChild = new Empty({ sketch: sketch });
          } else {
            if (latex) {
              this.parsedScript = null; /// so when an error occur in the next code, in the necxt time the parsed script will be null.
              this.parsedScript = sketch.scriptParser.parse(parser.latexTOmaxima(latex));
              this.vars = this.__getAll(this.parsedScript, { type: 'variable' }).map((a) => a.name);
              this.funcs = this.__getAll(this.parsedScript, { type: 'functionCalling' }).map((a) => a.name);
            }

            if (!this.parsedScript) return; /// syntax error ocurred, no possible update exist, this error happen before and now the parsedString is null, the error elt exists and stop updating all is done

            const props = {
              handlers: {
                onremove: (removeElt) => {
                  if (removeElt) this.remove(false);
                },
                onerror: (e) => {
                  this.error(e);
                },
              },
              control: this,
            };

            if (this.graphChild?.pen) props.pen = this.graphChild.pen;
            this.graphChild = sketch.childFromParsed(this.parsedScript, props); /// the parsed string is valid, no error are predicted on fetching the gc
          }
          this.__updateElts(prev, this.graphChild);
        } catch (e) {
          this.error(e);
        }
        if (!this.id) {
          /// consequently, am error occured, before assigning the new gc, after deleting the preious one.
          /// reverse the effect
          if (this._graphChild) {
            this.id = this._graphChild.id;
            sketch.children.set(this.id, this.graphChild);
          }
        }
        this.__updateDependants();
        sketch.update();
        if (this.status === 're-update') {
          this.status = 'ready';
          this.update(this.mathField.latex());
        } else if (this.status === 'updating') {
          this.status = 'ready';
        }
      } else {
        this.status = 're-update';
      }
    }
  }

  __getAll(parsed, check = {}) {
    let vars = [];
    if (parsed.check(check)) {
      return [parsed];
    }
    for (let i = 0; i < parsed.args.length; i++) {
      vars = vars.concat(this.__getAll(parsed.args[i], check));
    }
    return vars;
  }

  __updateDependants(prev) {
    if (this._graphChild instanceof Variable || this._graphChild instanceof Slider) {
      let size = sketch.children.size;
      sketch.children.forEach((gc) => {
        size--;
        if (size < 0) return;
        if (gc && gc !== this._graphChild && gc.control.vars) {
          if (gc.control.vars.find((a) => this._graphChild.id === a || (prev && a === prev.id))) gc.control.update();
        }
      });
    }
    if (this._graphChild instanceof Func) {
      let size = sketch.children.size;
      sketch.children.forEach((gc) => {
        size--;
        if (size < 0) return;
        if (gc && gc.control !== this && gc.control.vars) {
          if (gc.control.funcs.find((a) => this._graphChild.id === a || (prev && a === prev.id))) gc.control.update();
        }
      });
    }
  }

  setScript(script, handle = true) {
    if (!handle) {
      this.disableHandling = true;
    }
    this.mathField.latex(script);
    if (!handle) {
      this.disableHandling = false;
    }
  }

  focus(focusTheField = true) {
    if (this._graphChild instanceof Slider) {
      const sliderOuter = this.elt.querySelector('.slider-outer');
      if (sliderOuter?.classList.contains('play')) {
        this.elt.querySelector('.play-pause')?.click();
      }
    }
    if (keypadSettings.focusedControl && keypadSettings.focusedControl !== this) keypadSettings.focusedControl.blur();
    // setting this to be focuses
    keypadSettings.focusedControl = this;
    keypadSettings.mathField = this.mathField;
    if (focusTheField) this.mathField.focus();
    this.elt.classList.add('focus');
  }

  blur(blurTheField = true) {
    // keypadSettings.focusedControl = undefined;
    if (blurTheField) this.mathField.blur();
    this.elt.classList.remove('focus');
  }

  enter() {
    let index = Number.parseInt(this.orderELT.textContent);
    if (this.isError === 1) {
      this.blur();
      /// adding undefined
      const vars = this.elt.querySelectorAll('.not-exist .var');
      for (const v of vars) {
        v.click();
        index++;
      }

      const funcs = this.elt.querySelectorAll('.not-exist .func');
      for (const f of funcs) {
        f.click();
        index++;
      }
    }
    const newChild = new ChildControl();
    addControl(newChild, index);
  }

  error(e) {
    if (e instanceof UndefError) {
      const undef = e.undef;
      const undefVars = undef.vars.reduce((b, a) => `${b + a}, `, '').slice(0, -2);
      const undefFuncs = undef.funcs.reduce((b, a) => `${b + a}, `, '').slice(0, -2);
      const errorText =
        (undefVars ? `undefined vars [${undefVars}]` : '') + (undefFuncs ? `, undefined funcs [${undefFuncs}]` : '');
      this.error(new Error(`${errorText}, click the button to add.`));

      if (this.isError === 1) {
        // this.isError is 1 when vars or funcs are not exists
        /// remove the previous elts
        this.elt.querySelector('.main .not-exist').remove();
      }

      let buttonsVars = '';
      let buttonsFuncs = '';

      if (undef.vars.length > 0) {
        buttonsVars = '<div><span>vars: </span>';
        buttonsVars +=
          undef.vars.reduce((b, a) => {
            return `${b}<button class="var btn-3">${a}</button>`;
          }, '') || '';
        buttonsVars += undef.vars.length > 1 ? '<button class="all-vars btn-1">all</button>' : '';
        buttonsVars += '</div>';
      }

      if (undef.funcs.length > 0) {
        buttonsFuncs = '<div><span>funcs: </span>';
        buttonsFuncs +=
          undef.funcs.reduce((b, a) => {
            return `${b}<button class="func btn-3">${a}</button>`;
          }, '') || '';
        buttonsFuncs += undef.funcs.length > 1 ? '<button class="all-funcs btn-1">all</button>' : '';
        buttonsFuncs += '</div>';
      }

      const notExistElt = document.createElement('div');
      notExistElt.className = 'not-exist';
      notExistElt.innerHTML = buttonsVars + buttonsFuncs;

      const me = this;
      notExistElt.querySelectorAll('.var').forEach((varBtn) => {
        varBtn.addEventListener('click', function () {
          const id = this.innerText;
          // let gc = new ChildControl(new Slider({ id, value: 1, sketch: sketch }));
          addControl(`${id} = 1`, Number.parseInt(me.orderELT.textContent));
        });
      });

      notExistElt.querySelectorAll('.func').forEach((funcBtn) => {
        funcBtn.addEventListener('click', function () {
          /// choosing a param
          let param = 'a';
          let counter = 0;
          let end;
          while (Object.prototype.hasOwnProperty.call(Math, param) && !end) {
            if (counter > 300) {
              param = 'a';
              end = 1;
            } else if (counter > 100) {
              param = String.fromCharCode(math.random(65, 90));
            } else {
              param = String.fromCharCode(math.random(97, 122));
            }
            counter++;
          }
          const id = this.textContent;
          // let newChild = new ChildControl(new Func({ id, expr: new Node('variable', [], { name: param }), params: [param], sketch: sketch }));
          addControl(`${id}\\left(${param}\\right) = ${param}`, Number.parseInt(me.orderELT.textContent));
        });
      });

      notExistElt.querySelectorAll('.all-vars').forEach((allVarsBtn) => {
        allVarsBtn.addEventListener('click', () => {
          const vars = this.elt.querySelectorAll('.not-exist .var');
          for (const v of vars) {
            v.click();
          }
        });
      });

      notExistElt.querySelectorAll('.all-funcs').forEach((allFuncsBtn) => {
        allFuncsBtn.addEventListener('click', () => {
          const funcs = this.elt.querySelectorAll('.not-exist .func');
          for (const f of funcs) {
            f.click();
          }
        });
      });

      this.elt.querySelector('.main').appendChild(notExistElt);
      this.isError = 1;
    } else {
      if (this.isError) {
        const errorELT = this.elt.querySelector('.error-elt');
        errorELT.setAttribute('aria-label', e.message);
      } else {
        this.elt.classList.add('error');
        this.isError = true;
        this.graphChild.renderable = false;
        const errorELT = document.createElement('div');
        errorELT.className = 'error-elt';
        errorELT.innerHTML = '<i class="fas fa-bug"></i>';
        errorELT.setAttribute('data-balloon-pos', 'right');
        errorELT.setAttribute('aria-label', e.message);
        errorELT.style.display = 'none';
        this.elt.querySelector('.side-status').appendChild(errorELT);
        // Fade in animation
        setTimeout(() => {
          errorELT.style.transition = 'opacity 0.5s';
          errorELT.style.opacity = '0';
          errorELT.style.display = '';
          setTimeout(() => {
            errorELT.style.opacity = '1';
          }, 10);
        }, 200);
      }
      console.log(e);
    }
  }

  remove(removeGraphChild = true) {
    if (this._graphChild instanceof Slider) {
      const sliderOuter = this.elt.querySelector('.slider-outer');
      if (sliderOuter?.classList.contains('play')) {
        this.elt.querySelector('.play-pause')?.click();
      }
    }
    removeControl(this);
    if (removeGraphChild) {
      if (this.graphChild) this.graphChild.remove();
      this.__updateDependants();
    }
    sketch.update();
  }

  //#region updatingElt

  __updateElts(from, to) {
    //#region reset the current elts
    if (from && to && from.constructor !== to.constructor) {
      const eltsTOremove = this.elt.querySelectorAll('.special-elt');
      eltsTOremove.forEach((elt) => {
        elt.remove();
      });
    }
    if (this.isError === 1) {
      this.elt.querySelector('.not-exist').remove();
    }
    if (this.isError) {
      this.elt.classList.remove('error');
      this.elt.querySelector('.error-elt').remove();
      this.isError = false;
    }
    //#endregion

    if (to) {
      if (to instanceof Empty) {
        this.__toEmpty();
      } else if (to instanceof Xfunction) {
        if (from instanceof Xfunction) {
          this.__updateXfunction();
        } else {
          this.__toXfunction();
        }
      } else if (to instanceof EvalExpr) {
        if (from instanceof EvalExpr) {
          this.__updateEvalExpr();
        } else {
          this.__toEvalExpr();
        }
      } else if (to instanceof Variable) {
        if (from instanceof Variable) {
          this.__updateVariable();
        } else {
          this.__toVariable();
        }
      } else if (to instanceof Slider) {
        if (from instanceof Slider) {
          this.__updateSlider();
        } else {
          this.__toSlider();
        }
      }
    }
  }

  __toEmpty() {
    const sideStatus = this.elt.querySelector('.side-status');
  }

  __toXfunction() {
    const sideStatus = this.elt.querySelector('.side-status');
    const visibleElt = document.createElement('div');
    visibleElt.className = 'visible-elt special-elt visible';
    visibleElt.innerHTML = '<div class="inner"></div>';
    visibleElt.addEventListener('click', () => {
      visibleElt.classList.toggle('visible');
      this.graphChild.renderable = visibleElt.classList.contains('visible');
      this.graphChild.update();
      sketch.draw();
    });
    sideStatus.appendChild(visibleElt);
    this.__updateXfunction();
  }

  __updateXfunction() {
    const visibleELt = this.elt.querySelector('.side-status').querySelector('.visible');
    visibleELt.setAttribute('style', `--color: ${this.graphChild.pen.color.toString()}`);
  }

  __toEvalExpr() {
    const value = document.createElement('div');
    value.className = 'value special-elt';
    value.innerHTML = '<span></span>';
    value.style.display = 'none';
    this.elt.querySelector('.main').appendChild(value);
    // Fade in animation
    setTimeout(() => {
      value.style.transition = 'opacity 0.3s';
      value.style.opacity = '0';
      value.style.display = '';
      setTimeout(() => {
        value.style.opacity = '1';
      }, 10);
    }, 0);
    const valueType = document.createElement('div');
    valueType.className = 'value-type special-elt';
    valueType.setAttribute('type', 'decimal');
    valueType.innerHTML = '<span><i class="fas fa-divide"></i></span>';
    this.elt.querySelector('.side-status').appendChild(valueType);
    valueType.addEventListener('click', () => {
      switch (valueType.getAttribute('type')) {
        case 'decimal':
          valueType.setAttribute('type', 'fract');
          value.style.height = '56px';
          break;
        case 'fract':
          valueType.setAttribute('type', 'quotient');
          value.style.height = '56px';
          break;
        case 'quotient':
          valueType.setAttribute('type', 'decimal');
          value.style.height = '33px';
          break;
      }
      this.__updateEvalExpr();
    });

    this.sliderProps = {
      valueType: valueType,
      valueElt: value,
    };
    // this.__updateEvalExpr(); /// will be done on updating the sktech
  }

  __updateEvalExpr() {
    try {
      let value = this.graphChild.eval();
      if (!isNaN(value)) {
        value += 0; /// +0 is here to convert the object (representing the valueOf a variable) into a number
        value = Number.parseFloat(value.toFixed(10));
        switch (this.sliderProps.valueType.getAttribute('type')) {
          case 'decimal':
            {
              this.sliderProps.valueElt.innerHTML = `<span>${value}</span>`;
            }
            break;
          case 'fract':
            {
              if (value.toString().indexOf('.') > -1 && value.toString().split('.')[1].length < 5) {
                const fraction = Core.fraction(value);
                if (fraction.denominator === 1) {
                  this.sliderProps.valueElt.innerHTML = `<span>${fraction.numerator}</span>`;
                } else {
                  this.sliderProps.valueElt.innerHTML = `<span>\\frac{${fraction.numerator}}{${fraction.denominator}}</span>`;
                  MQ.StaticMath(this.sliderProps.valueElt.children[0]);
                }
              } else {
                this.sliderProps.valueElt.innerHTML = `<span>${value}</span>`;
              }
            }
            break;
          case 'quotient':
            {
              if (value.toString().indexOf('.') > -1 && value.toString().split('.')[1].length < 5) {
                const fraction = Core.quotientRemainder(value);
                if (fraction.numerator === 0) {
                  this.sliderProps.valueElt.innerHTML = `<span>${fraction.quotient}</span>`;
                } else {
                  if (fraction.quotient === 0) {
                    this.sliderProps.valueElt.innerHTML = `<span>\\frac{${fraction.numerator}}{${fraction.denominator}}</span>`;
                  } else {
                    this.sliderProps.valueElt.innerHTML = `<span>${fraction.quotient}\\frac{${fraction.numerator}}{${fraction.denominator}}</span>`;
                  }
                  MQ.StaticMath(this.sliderProps.valueElt.children[0]);
                }
              } else {
                this.sliderProps.valueElt.innerHTML = `<span>${value}</span>`;
              }
            }
            break;
        }
      } else {
        this.sliderProps.valueElt.innerHTML = '<span>NaN</span>';
      }
    } catch (e) {
      this.sliderProps.valueElt.innerHTML = '<span>NaN</span>';
      this.error(e);
    }
  }

  __toSlider() {
    /// adding slider
    const sliderOuter = document.createElement('div');
    sliderOuter.className = 'slider-outer special-elt';
    sliderOuter.innerHTML = `
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
      </div>`;
    this.elt.querySelector('.main').appendChild(sliderOuter);
    const slider = sliderOuter.querySelector('.slider');

    const playPause = sliderOuter.querySelector('.play-pause');
    if (playPause) {
      playPause.addEventListener('click', () => {
        sliderOuter.classList.toggle('play');
        if (sliderOuter.classList.contains('play')) {
          slidersAutoplay.push(this);
        } else {
          slidersAutoplay.pop(this);
        }
      });
    }

    const pause = () => {
      if (sliderOuter.classList.contains('play')) {
        const playPause = sliderOuter.querySelector('.play-pause');
        if (playPause) playPause.click();
      }
    };

    // sliderControllerMathFields
    const attrs = {
      min: MQ.MathField(sliderOuter.querySelector('.slider-controller .math-field.min'), {
        handlers: {
          edit: () => {
            pause();
            slider.min = getJSfunction(attrs.min.latex())();
          },
        },
      }),
      max: MQ.MathField(sliderOuter.querySelector('.slider-controller .math-field.max'), {
        handlers: {
          edit: () => {
            pause();
            slider.max = getJSfunction(attrs.max.latex())();
          },
        },
      }),
      step: MQ.MathField(sliderOuter.querySelector('.slider-controller .math-field.step'), {
        handlers: {
          edit: () => {
            pause();
            slider.step = getJSfunction(attrs.step.latex())();
          },
        },
      }),
      /** oscillate, forwards, backwards*/
      dir: 'oscillate',
      // positive int number represents the steps per second (the unit: sps)
      speed: 50, // how much percent of the full slider per second
      // to change the direction of the slider will working (the play button has been pressed)
      sliderDirection: 1,
    };

    /// the special properties for this specific type of GraphChild
    this.sliderProps = {
      slider,
      sliderOuter,
      attrs,
      invokeOnchange: true,
    };

    slider.addEventListener('onchange', (event) => {
      if (this.sliderProps.invokeOnchange) {
        const handlerParams = event.handlerParams || [];
        this.graphChild.setValue(Number.parseFloat(slider.value), handlerParams);
        this.setScript(`${this.graphChild.id} = ${slider.value}`, false);
      }
    });

    const handleMouseMove = () => {
      if (slider.ismousedown) {
        slider.dispatchEvent(new CustomEvent('onchange', { handlerParams: [{ updateSliderElement: false }] }));
      }
    };
    slider.addEventListener('mousemove', handleMouseMove);
    slider.addEventListener('touchmove', handleMouseMove);

    const handleMouseDown = () => {
      pause();
      slider.ismousedown = true;
    };
    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('touchstart', handleMouseDown);

    const handleMouseUp = () => {
      slider.ismousedown = false;
    };
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('touchend', handleMouseUp);

    const sliderControllerToggle = sliderOuter.querySelector('.slider-controller-toggle');
    if (sliderControllerToggle) {
      sliderControllerToggle.addEventListener('click', () => {
        sliderOuter.classList.toggle('controller-opended');
      });
    }

    this.__updateSlider();
  }

  __updateSlider() {
    const slider = this.sliderProps.slider;
    const value = this.graphChild.getValue();

    this.sliderProps.attrs.min.latex(Math.min(Number.parseFloat(slider.min), Number.parseFloat(value)));
    this.sliderProps.attrs.max.latex(Math.max(Number.parseFloat(slider.max), Number.parseFloat(value)));

    this.sliderProps.invokeOnchange = false;
    slider.value = value;
    this.sliderProps.invokeOnchange = true;

    // this.setScript(this.graphChild.id + ' = ' + slider.value, false);
  }

  __toVariable() {
    this.sliderProps = {};

    // this.__updateEvalExpr(); /// will be done on updating the sktech
  }

  __updateVariable() { }
  //#endregion
}

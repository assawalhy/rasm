import { UndefError } from '../core/Errors/index.js';
import { Empty, Func, Slider, Variable } from '../core/GraphChildren/index.js';
import { addControl, keypadSettings, removeControl } from './global.js';
import sketch from './sketch.js';
import { parser, Core } from "@rasm/math";
import { Node } from "@rasm/magical-parser";
import { RendererFactory } from './renderers/index.js';

export default class ChildControl {
  disableUpdate = false;

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
    this.updateElts(null, this.graphChild);

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
    // Clean up old renderer if exists
    if (this.renderer) {
      this.renderer.cleanup();
    }

    this._graphChild = value;
    this.id = value.id;
    value.control = this;

    // Create new renderer for this graph child type
    this.renderer = RendererFactory.create(value, this);

    // Let the renderer set up any type-specific handlers
    if (this.renderer.setupHandlers) {
      this.renderer.setupHandlers();
    }
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
    if (this.disableUpdate) return;
    if (this.status === 'ready') {
      this.pauseIfSlider();
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
            this.parsedScript = null; // so when an error occur in the next code, in the necxt time the parsed script will be null.
            this.parsedScript = sketch.scriptParser.parse(parser.latexTOmaxima(latex));
            this.vars = this.getAllParsedNodes(this.parsedScript, { type: 'variable' }).map((a) => a.name);
            this.funcs = this.getAllParsedNodes(this.parsedScript, { type: 'functionCalling' }).map((a) => a.name);
          }

          // syntax error ocurred, no possible update exist
          // the error element should have been updated
          if (!this.parsedScript) return;

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

          if (this.graphChild?.pen) props.pen = this.graphChild.pen; // keep the same color and pen configuration
          this.graphChild = sketch.childFromParsed(this.parsedScript, props);
        }
        this.updateElts(prev, this.graphChild);
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
      this.updateDependants();
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

  getAllParsedNodes(node, check = {}) {
    let vars = [];
    if (node.check(check)) {
      return [node];
    }
    for (let i = 0; i < node.args.length; i++) {
      vars = vars.concat(this.getAllParsedNodes(node.args[i], check));
    }
    return vars;
  }

  updateDependants(oldGraphChild) {
    if (this.isVariableOrSlider()) {
      let size = sketch.children.size;
      sketch.children.forEach((child) => {
        size--;
        if (size < 0) return;
        if (child && child !== this._graphChild && child.control.vars) {
          if (child.control.vars.find((a) => this._graphChild.id === a || (oldGraphChild && a === oldGraphChild.id))) child.control.update();
        }
      });
    }
    if (this._graphChild instanceof Func) {
      let size = sketch.children.size;
      sketch.children.forEach((child) => {
        size--;
        if (size < 0) return;
        if (child && child.control !== this && child.control.vars) {
          if (child.control.funcs.find((a) => this._graphChild.id === a || (oldGraphChild && a === oldGraphChild.id))) child.control.update();
        }
      });
    }
  }

  isVariableOrSlider() {
    return this._graphChild instanceof Variable || this._graphChild instanceof Slider;
  }

  setLatex(latex, disableUpdate = false) {
    const originalDisableUpdate = this.disableUpdate;
    this.disableUpdate = disableUpdate;
    this.mathField.latex(latex);
    this.disableUpdate = originalDisableUpdate;
  }

  focus(focusTheField = true) {
    this.pauseIfSlider();
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
      this.error(new Error(`${errorText}`));

      if (this.isError === 1) {
        // this.isError is 1 when vars or funcs are not existing
        // remove the previous elts
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
          addControl(`${id} = 1`, Number.parseInt(me.orderELT.textContent));
        });
      });

      notExistElt.querySelectorAll('.func').forEach((funcBtn) => {
        funcBtn.addEventListener('click', () => {
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
          const id = funcBtn.textContent;
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
    this.pauseIfSlider();
    removeControl(this);
    if (removeGraphChild) {
      if (this.graphChild) this.graphChild.remove();
      this.updateDependants();
    }
    sketch.update();
  }

  updateElts(from, to) {
    // Clean up error UI if present
    if (this.isError === 1) {
      const notExist = this.elt.querySelector('.not-exist');
      if (notExist) notExist.remove();
    }
    if (this.isError) {
      this.elt.classList.remove('error');
      const errorElt = this.elt.querySelector('.error-elt');
      if (errorElt) errorElt.remove();
      this.isError = false;
    }

    // Render the new graph child using its renderer
    if (to && this.renderer) {
      const mainContainer = this.elt.querySelector('.main');
      this.renderer.render(mainContainer);
    }
  }

  pauseIfSlider() {
    if (this.renderer && typeof this.renderer.pauseSlider === 'function') {
      this.renderer.pauseSlider();
    }
  }
}

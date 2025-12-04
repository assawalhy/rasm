import BaseRenderer from './BaseRenderer.js';
import { Core } from '@rasm/math';

/**
 * Renderer for EvalExpr graph children (expressions that evaluate to a value)
 */
export default class EvalExprRenderer extends BaseRenderer {
  /**
   * Set up handlers for expression updates
   */
  setupHandlers() {
    this.graphChild.handlers.onupdate = () => {
      this.update();
    };
  }

  render(container) {
    const mainContainer = this.control.elt.querySelector('.main');
    const sideStatus = this.control.elt.querySelector('.side-status');

    // Create value display element
    const valueElt = this.createElement(`
      <div class="value special-elt">
        <span></span>
      </div>
    `);

    mainContainer.appendChild(valueElt);
    this.fadeIn(valueElt);
    this.elements.valueElt = valueElt;

    // Create value type toggle (decimal/fraction/quotient)
    const valueType = this.createElement(`
      <div class="value-type special-elt" type="decimal">
        <span><i class="fas fa-divide"></i></span>
      </div>
    `);

    this.addEventListener(valueType, 'click', () => {
      const currentType = valueType.getAttribute('type');

      switch (currentType) {
        case 'decimal':
          valueType.setAttribute('type', 'fract');
          valueElt.style.height = '56px';
          break;
        case 'fract':
          valueType.setAttribute('type', 'quotient');
          valueElt.style.height = '56px';
          break;
        case 'quotient':
          valueType.setAttribute('type', 'decimal');
          valueElt.style.height = '33px';
          break;
      }

      this.update();
    });

    sideStatus.appendChild(valueType);
    this.elements.valueType = valueType;

    // Store references for compatibility
    this.control.sliderProps = {
      valueType: valueType,
      valueElt: valueElt,
    };
  }

  update() {
    try {
      let value = this.graphChild.eval();

      if (!isNaN(value)) {
        value += 0; // Convert to number
        value = Number.parseFloat(value.toFixed(10));

        const type = this.elements.valueType.getAttribute('type');

        switch (type) {
          case 'decimal':
            this.elements.valueElt.innerHTML = `<span>${value}</span>`;
            break;

          case 'fract':
            this.renderFraction(value);
            break;

          case 'quotient':
            this.renderQuotient(value);
            break;
        }
      } else {
        this.elements.valueElt.innerHTML = '<span>NaN</span>';
      }
    } catch (e) {
      this.elements.valueElt.innerHTML = '<span>NaN</span>';
      this.control.error(e);
    }
  }

  renderFraction(value) {
    if (value.toString().indexOf('.') > -1 && value.toString().split('.')[1].length < 5) {
      const fraction = Core.fraction(value);

      if (fraction.denominator === 1) {
        this.elements.valueElt.innerHTML = `<span>${fraction.numerator}</span>`;
      } else {
        this.elements.valueElt.innerHTML =
          `<span>\\frac{${fraction.numerator}}{${fraction.denominator}}</span>`;
      }
    } else {
      this.elements.valueElt.innerHTML = `<span>${value}</span>`;
    }

    MQ.StaticMath(this.elements.valueElt.children[0]);
  }

  renderQuotient(value) {
    if (value.toString().indexOf('.') > -1 && value.toString().split('.')[1].length < 5) {
      const fraction = Core.quotientRemainder(value);

      if (fraction.numerator === 0) {
        this.elements.valueElt.innerHTML = `<span>${fraction.quotient}</span>`;
      } else if (fraction.quotient === 0) {
        this.elements.valueElt.innerHTML =
          `<span>\\frac{${fraction.numerator}}{${fraction.denominator}}</span>`;
      } else {
        this.elements.valueElt.innerHTML =
          `<span>${fraction.quotient}\\frac{${fraction.numerator}}{${fraction.denominator}}</span>`;
      }
    } else {
      this.elements.valueElt.innerHTML = `<span>${value}</span>`;
    }

    MQ.StaticMath(this.elements.valueElt.children[0]);
  }
}

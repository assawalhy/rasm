import { createSignal, Show, createEffect, onMount } from "solid-js";
import styles from "./EvalExprControls.module.scss";
import {
  IconCalculator,
  IconMathXDivideY2,
  IconNumbers,
} from "@tabler/icons-solidjs";
import { mathQuill } from "@/utils/mathQuill";

/**
 * EvalExprControls component - displays evaluated expression results
 */
export default function EvalExprControls(props) {
  const [displayType, setDisplayType] = createSignal("decimal"); // decimal, fraction, quotient
  const [displayValue, setDisplayValue] = createSignal("0");
  const [error, setError] = createSignal(null);
  let valueMathField = null;
  let valueMathFieldContainer = null;

  // Initialize MathQuill when component mounts
  onMount(() => {
    if (valueMathFieldContainer) {
      valueMathField = mathQuill.StaticMath(valueMathFieldContainer);
      updateMathField();
    }
  });

  // Update display when expression or display type changes
  createEffect(() => {
    if (!props.graphChild) return;

    try {
      const value = props.graphChild.eval();
      updateDisplayValue(value);
      setError(null);
      props.clearError();
    } catch (e) {
      setError(e);
      props.displayError(e);
      updateDisplayValue(Number.NaN);
    }
  });

  const updateDisplayValue = (value) => {
    if (isNaN(value)) {
      setDisplayValue("\\text{NaN}");
      return;
    }

    const numValue = Number.parseFloat(value.toFixed(10));

    switch (displayType()) {
      case "fraction":
        setDisplayValue(formatAsFraction(numValue));
        break;
      case "quotient":
        setDisplayValue(formatAsQuotient(numValue));
        break;
      default: // decimal
        setDisplayValue(numValue.toString());
    }
  };

  const formatAsFraction = (value) => {
    if (value % 1 === 0) return value.toString();

    // Simple fraction approximation
    const tolerance = 1.0e-6;
    let h1 = 1;
    let h2 = 0;
    let k1 = 0;
    let k2 = 1;
    let b = value;

    do {
      const a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
    } while (Math.abs(value - h1 / k1) > value * tolerance);

    return `\\frac{${h1}}{${k1}}`;
  };

  const formatAsQuotient = (value) => {
    const whole = Math.floor(value);
    const remainder = value - whole;

    if (remainder === 0) return whole.toString();

    const fraction = formatAsFraction(remainder).replace("\\frac", "");
    return `${whole}${fraction}`;
  };

  const updateMathField = () => {
    if (valueMathField) {
      valueMathField.latex(`= ${displayValue()}`);
    }
  };

  const toggleDisplayType = () => {
    const types = ["decimal", "fraction", "quotient"];
    const currentIndex = types.indexOf(displayType());
    const nextIndex = (currentIndex + 1) % types.length;
    setDisplayType(types[nextIndex]);

    // Re-evaluate the current value with the new display type
    if (props.graphChild) {
      try {
        const value = props.graphChild.eval();
        updateDisplayValue(value);
      } catch (e) {
        setError(e);
        props.displayError(e);
      }
    }
  };

  return (
    <div class={styles.evalExpr}>
      <div class={styles.value}>
        <span
          class={styles.result}
          classList={{ [styles.error]: error() }}
          ref={valueMathFieldContainer}
        >
          = {displayValue()}
        </span>
      </div>

      <button
        type='button'
        class={styles.toggleButton}
        onClick={toggleDisplayType}
        title={`Display as ${displayType()}`}
        disabled={!props.graphChild}
      >
        <Show when={displayType() === "decimal"}>
          <IconCalculator size={18} />
        </Show>
        <Show when={displayType() === "fraction"}>
          <IconMathXDivideY2 size={18} />
        </Show>
        <Show when={displayType() === "quotient"}>
          <IconNumbers size={18} />
        </Show>
      </button>
    </div>
  );
}

import MathField from "@components/UI/MathField";
import { Node } from "@rasm/magical-parser";
import { parser } from "@rasm/math";
import { addControl, updateControl } from "@stores/controlsStore";
import { getSketch, isSketchReady } from "@stores/sketchInstance";
import { requestRedraw } from "@stores/sketchStore";
import { For, Show, createSignal, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Button } from "@components/ui/button";
import { IconX } from "@tabler/icons-solidjs";
import { UndefError } from "../../core/Errors/index.js";
import { Empty } from "../../core/GraphChildren/index.js";
import styles from "./ChildControl.module.scss";
import EmptyControls from "./controls/EmptyControls";
import EvalExprControls from "./controls/EvalExprControls";
import SliderControls from "./controls/SliderControls";
import VariableControls from "./controls/VariableControls";
import XfunctionControls from "./controls/XfunctionControls";

// Controls map based on graph child type
const controlsMap = {
  Slider: SliderControls,
  EvalExpr: EvalExprControls,
  Xfunction: XfunctionControls,
  Variable: VariableControls,
  Empty: EmptyControls,
};

// Debounce delay for showing errors (ms)
const ERROR_DEBOUNCE_MS = 500;

/**
 * Get all parsed nodes matching a check from a node tree
 */
function getAllParsedNodes(node, check = {}) {
  let vars = [];
  if (node.check(check)) {
    return [node];
  }
  for (let i = 0; i < node.args.length; i++) {
    vars = vars.concat(getAllParsedNodes(node.args[i], check));
  }
  return vars;
}

/**
 * ChildControl component - manages individual graph elements
 * Replaces the vanilla JS ChildControl class
 */
export default function ChildControl(props) {
  const [latex, setLatex] = createSignal(props.control?.latex || "");
  const [isError, setIsError] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const [isFocused, setIsFocused] = createSignal(false);
  const [graphChild, setGraphChild] = createSignal(
    props.control?.graphChild || null
  );
  const [updateStatus, setUpdateStatus] = createSignal("ready"); // 'ready', 'updating', 're-update'

  // Undefined variables/functions tracking
  const [missingVars, setMissingVars] = createSignal([]);
  const [missingFuncs, setMissingFuncs] = createSignal([]);
  const [mathField, setMathField] = createSignal(null);

  let errorDebounceTimer = null;
  let pendingError = null;
  let skipEdit = false;

  // Cleanup debounce timer on unmount
  onCleanup(() => {
    if (errorDebounceTimer) {
      clearTimeout(errorDebounceTimer);
    }
  });

  const getControls = () => {
    const child = graphChild();
    if (!child) return controlsMap.Empty;
    const type = child.constructor.name;
    return controlsMap[type] || null;
  };

  /**
   * Show error with debounce
   */
  const showErrorDebounced = (error) => {
    console.error("child control error", graphChild());
    console.error(error);
    pendingError = error;

    // Clear existing timer
    if (errorDebounceTimer) {
      clearTimeout(errorDebounceTimer);
    }

    // Set new debounce timer
    errorDebounceTimer = setTimeout(() => {
      if (pendingError) {
        displayError(pendingError);
      }
    }, ERROR_DEBOUNCE_MS);
  };

  /**
   * Display error immediately
   */
  const displayError = (error) => {
    if (error instanceof UndefError) {
      // Handle undefined variables/functions specially
      const undef = error.undef || {};
      setMissingVars(undef.vars || []);
      setMissingFuncs(undef.funcs || []);

      const missingItems = [...(undef.vars || []), ...(undef.funcs || [])];
      const message =
        missingItems.length > 0
          ? `Undefined: ${missingItems.join(", ")}`
          : "Undefined reference";

      setIsError(true);
      setErrorMessage(message);
    } else {
      // Regular error
      setMissingVars([]);
      setMissingFuncs([]);
      setIsError(true);
      setErrorMessage(error.message || "Parse error");
    }

    updateControl(props.control.id, {
      isError: true,
      errorMessage: errorMessage(),
    });
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    if (errorDebounceTimer) {
      clearTimeout(errorDebounceTimer);
      errorDebounceTimer = null;
    }
    pendingError = null;
    setIsError(false);
    setErrorMessage("");
    setMissingVars([]);
    setMissingFuncs([]);
  };

  /**
   * Add a missing variable as a new control
   */
  const addMissingVariable = (varName) => {
    const currentIndex = props.order || 1;
    // Add a control for this variable (e.g., "a = 1")
    addControl({ latex: `${varName}=1` }, currentIndex);

    // Re-parse current expression after a short delay to let the new var be registered
    setTimeout(() => {
      handleEdit(latex());
    }, 100);
  };

  /**
   * Add all missing variables as new controls
   */
  const addAllMissingVariables = () => {
    const vars = missingVars();
    const funcs = missingFuncs();
    const currentIndex = props.order || 1;

    // Add controls for all missing variables
    let offset = 0;
    for (const varName of vars) {
      addControl({ latex: `${varName}=1` }, currentIndex + offset);
      offset++;
    }

    // Add controls for all missing functions (basic function definition)
    for (const funcName of funcs) {
      addControl({ latex: `${funcName}(x)=x` }, currentIndex + offset);
      offset++;
    }

    // Re-parse current expression
    setTimeout(() => {
      handleEdit(latex());
    }, 100);
  };

  /**
   * Parse latex and create/update graph child
   */
  const handleEdit = (newLatex) => {
    // Skip if this edit was triggered by dryUpdateLatex
    if (skipEdit) {
      return;
    }

    setLatex(newLatex);
    props.onEdit?.(newLatex);

    const sketch = getSketch();
    if (!sketch || !isSketchReady()) {
      // Sketch not ready yet, just store the latex
      updateControl(props.control.id, { latex: newLatex });
      return;
    }

    // Handle update status (prevent concurrent updates)
    if (updateStatus() === "updating") {
      setUpdateStatus("re-update");
      return;
    }

    setUpdateStatus("updating");

    let parsedScript = null;
    let vars = [];
    let funcs = [];

    try {
      const prevChild = graphChild();

      // Remove previous child from sketch
      if (prevChild?.id) {
        sketch.children.delete(prevChild.id);
      }

      let newGraphChild;

      if (newLatex === "") {
        parsedScript = new Node("");
        newGraphChild = new Empty({ sketch });
      } else {
        // Parse the latex to maxima format, then parse with sketch parser
        const maximaExpr = parser.latexTOmaxima(newLatex);
        parsedScript = sketch.scriptParser.parse(maximaExpr);

        // Extract vars and funcs for dependency tracking
        vars = getAllParsedNodes(parsedScript, { type: "variable" }).map(
          (a) => a.name
        );
        funcs = getAllParsedNodes(parsedScript, {
          type: "functionCalling",
        }).map((a) => a.name);

        // Create graph child from parsed expression
        const childProps = {
          control: props.control,
          handlers: {
            onerror: (e) => displayError(e),
          },
        };

        // Preserve pen settings if they exist
        if (prevChild?.pen) {
          childProps.pen = prevChild.pen;
        }

        newGraphChild = sketch.childFromParsed(parsedScript, childProps);
      }

      // Update local and store state
      setGraphChild(newGraphChild);
      clearError();

      updateControl(props.control.id, {
        latex: newLatex,
        parsedScript,
        vars,
        funcs,
        validLatex: newLatex,
        validParsedScript: parsedScript,
        validVars: vars,
        validFuncs: vars,
        graphChild: newGraphChild,
        isError: false,
        errorMessage: "",
      });

      // Request canvas redraw
      requestRedraw();
    } catch (e) {
      // Show error with debounce (don't interrupt typing)
      showErrorDebounced(e);
      updateControl(props.control.id, {
        latex: newLatex,
        parsedScript,
        vars,
        funcs,
      });
    }

    // Check for queued re-update
    if (updateStatus() === "re-update") {
      setUpdateStatus("ready");
      handleEdit(latex());
    } else {
      setUpdateStatus("ready");
    }
  };

  const handleEnter = () => {
    // If there are missing variables, add them all first
    if (missingVars().length > 0 || missingFuncs().length > 0) {
      addAllMissingVariables();
      return;
    }

    // Otherwise, add a new control after this one
    const currentIndex = props.order || 1;
    addControl({}, currentIndex);
    props.onEnter?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
    props.onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Show any pending error immediately on blur
    if (pendingError) {
      if (errorDebounceTimer) {
        clearTimeout(errorDebounceTimer);
        errorDebounceTimer = null;
      }
      displayError(pendingError);
      pendingError = null;
    }

    props.onBlur?.();
  };

  // Sync with props.control changes
  // createEffect(() => {
  //   console.log('syncing', props);
  //   if (props.control) {
  //     if (props.control.latex !== latex()) {
  //       setLatex(props.control.latex || '');
  //     }
  //     if (props.control.graphChild !== graphChild()) {
  //       setGraphChild(props.control.graphChild);
  //     }
  //   }
  // });

  /**
   * Update math field latex without triggering edit event
   * Used by child controls (like sliders) to update display value without re-parsing
   */
  const dryUpdateLatex = (newLatex) => {
    skipEdit = true;
    const mf = mathField();
    if (mf) {
      mf.latex(newLatex);
    }
    setLatex(newLatex);
    skipEdit = false;
  };

  /**
   * Toggle graph child visibility
   */
  const toggleVisibility = () => {
    const child = graphChild();
    if (child) {
      child.renderable = !child.renderable;
      // Force update to reflect change
      setGraphChild({ ...child });
      requestRedraw();
    }
  };

  const getLeftControls = () => {
    const Comp = getControls();
    return Comp?.Left ? Comp.Left : null;
  };

  const getBottomControls = () => {
    const Comp = getControls();
    // If it has a Bottom property, use that. Otherwise, the component itself is the bottom control (legacy support)
    return Comp?.Bottom ? Comp.Bottom : Comp?.Left ? null : Comp;
  };

  return (
    <div
      class={styles.childControl}
      classList={{
        [styles.focus]: isFocused(),
        [styles.error]: isError(),
      }}
    >
      {/* Left Column: Specific controls like Color Picker */}
      <div class={styles.leftControls}>
        <Show when={getLeftControls()}>
          <Dynamic
            component={getLeftControls()}
            graphChild={graphChild()}
            control={props.control}
            mathField={mathField()}
            displayError={displayError}
            showErrorDebounced={showErrorDebounced}
            clearError={clearError}
            dryUpdateLatex={dryUpdateLatex}
          />
        </Show>
      </div>

      {/* Main Column: MathField and Bottom Controls */}
      <div class={styles.main}>
        <div class={styles.script}>
          <MathField
            setMathField={setMathField}
            value={latex()}
            onEdit={handleEdit}
            onEnter={handleEnter}
            onFocus={handleFocus}
            onBlur={handleBlur}
            class={styles.mathField}
          />
        </div>

        <Show when={getBottomControls()}>
          <Dynamic
            component={getBottomControls()}
            graphChild={graphChild()}
            control={props.control}
            mathField={mathField()}
            displayError={displayError}
            showErrorDebounced={showErrorDebounced}
            clearError={clearError}
            dryUpdateLatex={dryUpdateLatex}
          />
        </Show>

        {/* Error message with undefined variable buttons */}
        <Show when={isError()}>
          <div class={styles.errorContainer}>
            <div class={styles.errorMessage}>{errorMessage()}</div>

            {/* Buttons to add missing variables/functions */}
            <Show when={missingVars().length > 0 || missingFuncs().length > 0}>
              <div class={styles.missingItems}>
                <For each={missingVars()}>
                  {(varName) => (
                    <button
                      type='button'
                      class={styles.addMissingButton}
                      onClick={() => addMissingVariable(varName)}
                      title={`Add variable ${varName}`}
                    >
                      <i class='fas fa-plus' /> {varName}
                    </button>
                  )}
                </For>
                <For each={missingFuncs()}>
                  {(funcName) => (
                    <button
                      type='button'
                      class={styles.addMissingButton}
                      onClick={() => addMissingVariable(funcName)}
                      title={`Add function ${funcName}`}
                    >
                      <i class='fas fa-plus' /> {funcName}()
                    </button>
                  )}
                </For>

                {/* Add all button if multiple missing */}
                <Show when={missingVars().length + missingFuncs().length > 1}>
                  <button
                    type='button'
                    class={`${styles.addMissingButton} ${styles.addAllButton}`}
                    onClick={addAllMissingVariables}
                    title='Add all missing (or press Enter)'
                  >
                    <i class='fas fa-plus-circle' /> Add all
                  </button>
                </Show>
              </div>
            </Show>
          </div>
        </Show>
      </div>

      {/* Right Column: Delete and Order/Visibility */}
      <div class={styles.sideStatus}>
        <Button
          variant='ghost'
          size='xs'
          class={styles.removeButton}
          onClick={() => props.onRemove?.()}
          title='Remove'
        >
          <IconX size={16} />
        </Button>

        <button
          type='button'
          class={styles.order}
          classList={{
            [styles.hidden]: graphChild() && !graphChild().renderable,
          }}
          onClick={toggleVisibility}
          title={graphChild() && !graphChild().renderable ? "Show" : "Hide"}
        >
          {props.order || 1}
        </button>
      </div>
    </div>
  );
}

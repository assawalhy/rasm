import MathField from '@components/UI/MathField';
import { Node } from '@rasm/magical-parser';
import { parser } from '@rasm/math';
import { addControl, updateControl } from '@stores/controlsStore';
import { getSketch, isSketchReady } from '@stores/sketchInstance';
import { requestRedraw } from '@stores/sketchStore';
import { Show, createEffect, createSignal, onMount } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Empty } from '../../core/GraphChildren/index.js';
import styles from './ChildControl.module.scss';
import EmptyRenderer from './renderers/EmptyRenderer';
import EvalExprRenderer from './renderers/EvalExprRenderer';
import SliderRenderer from './renderers/SliderRenderer';
import VariableRenderer from './renderers/VariableRenderer';
import XfunctionRenderer from './renderers/XfunctionRenderer';

// Renderer map based on graph child type
const rendererMap = {
  Slider: SliderRenderer,
  EvalExpr: EvalExprRenderer,
  Xfunction: XfunctionRenderer,
  Variable: VariableRenderer,
  Empty: EmptyRenderer,
};

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
  const [latex, setLatex] = createSignal(props.control?.latex || '');
  const [isError, setIsError] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal('');
  const [isFocused, setIsFocused] = createSignal(false);
  const [graphChild, setGraphChild] = createSignal(props.control?.graphChild || null);
  const [updateStatus, setUpdateStatus] = createSignal('ready'); // 'ready', 'updating', 're-update'

  let mathFieldRef;

  const getRenderer = () => {
    const child = graphChild();
    if (!child) return null;
    const type = child.constructor.name;
    return rendererMap[type] || null;
  };

  /**
   * Parse latex and create/update graph child
   */
  const handleEdit = (newLatex) => {
    setLatex(newLatex);
    props.onEdit?.(newLatex);

    const sketch = getSketch();
    if (!sketch || !isSketchReady()) {
      // Sketch not ready yet, just store the latex
      updateControl(props.control.id, { latex: newLatex });
      return;
    }

    // Handle update status (prevent concurrent updates)
    if (updateStatus() === 'updating') {
      setUpdateStatus('re-update');
      return;
    }

    setUpdateStatus('updating');

    try {
      const prevChild = graphChild();

      // Remove previous child from sketch
      if (prevChild?.id) {
        sketch.children.delete(prevChild.id);
      }

      let newGraphChild;
      let parsedScript = null;
      let vars = [];
      let funcs = [];

      if (newLatex === '') {
        parsedScript = new Node('');
        newGraphChild = new Empty({ sketch });
      } else {
        // Parse the latex to maxima format, then parse with sketch parser
        const maximaExpr = parser.latexTOmaxima(newLatex);
        parsedScript = sketch.scriptParser.parse(maximaExpr);

        // Extract vars and funcs for dependency tracking
        vars = getAllParsedNodes(parsedScript, { type: 'variable' }).map((a) => a.name);
        funcs = getAllParsedNodes(parsedScript, { type: 'functionCalling' }).map((a) => a.name);

        // Create graph child from parsed expression
        const childProps = {
          control: props.control,
          handlers: {
            onerror: (e) => handleError(e),
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
      setIsError(false);
      setErrorMessage('');

      updateControl(props.control.id, {
        latex: newLatex,
        graphChild: newGraphChild,
        parsedScript,
        vars,
        funcs,
        isError: false,
        errorMessage: '',
      });

      // Request canvas redraw
      requestRedraw();
    } catch (e) {
      handleError(e);
    }

    // Check for queued re-update
    if (updateStatus() === 're-update') {
      setUpdateStatus('ready');
      handleEdit(latex());
    } else {
      setUpdateStatus('ready');
    }
  };

  const handleError = (e) => {
    console.error('ChildControl parse error:', e);
    setIsError(true);
    setErrorMessage(e.message || 'Parse error');

    updateControl(props.control.id, {
      isError: true,
      errorMessage: e.message || 'Parse error',
    });
  };

  const handleEnter = () => {
    // Add a new control after this one
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
    props.onBlur?.();
  };

  // Sync with props.control changes
  createEffect(() => {
    if (props.control) {
      if (props.control.latex !== latex()) {
        setLatex(props.control.latex || '');
      }
      if (props.control.graphChild !== graphChild()) {
        setGraphChild(props.control.graphChild);
      }
    }
  });

  return (
    <div
      class={styles.childControl}
      classList={{
        [styles.focus]: isFocused(),
        [styles.error]: isError(),
      }}
    >
      <div class={styles.order}>{props.order || 1}</div>

      <div class={styles.main}>
        <div class={styles.script}>
          <MathField
            ref={(ref) => {
              mathFieldRef = ref;
            }}
            value={latex()}
            onEdit={handleEdit}
            onEnter={handleEnter}
            onFocus={handleFocus}
            onBlur={handleBlur}
            class={styles.mathField}
          />
        </div>

        <Show when={getRenderer()}>
          <Dynamic component={getRenderer()} graphChild={graphChild()} control={props.control} />
        </Show>

        <Show when={isError()}>
          <div class={styles.errorMessage}>{errorMessage()}</div>
        </Show>
      </div>

      <div class={styles.sideStatus}>
        <button type="button" class={styles.removeButton} onClick={() => props.onRemove?.()} title="Remove">
          <i class="fas fa-times" />
        </button>
      </div>
    </div>
  );
}

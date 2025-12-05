import { createEffect, onCleanup, onMount } from 'solid-js';

/**
 * MathField wrapper component for MathQuill integration
 * This is the only component that uses jQuery (required by MathQuill)
 */
export default function MathField(props) {
  let fieldRef;
  let mqInstance;
  let handleFocus;
  let handleBlur;

  onMount(() => {
    if (!fieldRef || !window.MQ) {
      console.error('MathQuill not loaded');
      return;
    }

    // Initialize MathQuill
    const MQ = window.MQ.MathField(fieldRef, {
      spaceBehavesLikeTab: true,
      leftRightIntoCmdGoes: 'up',
      restrictMismatchedBrackets: true,
      sumStartsWithNEquals: true,
      supSubsRequireOperand: true,
      charsThatBreakOutOfSupSub: '+-=<>',
      autoSubscriptNumerals: true,
      autoCommands:
        'pi theta sqrt sum prod alpha beta gamma delta epsilon zeta eta mu nu xi rho sigma tau phi chi psi omega',
      autoOperatorNames: 'sin cos tan sec csc cot sinh cosh tanh ln log',
      handlers: {
        edit: () => {
          if (mqInstance) {
            const latex = mqInstance.latex();
            props.onEdit?.(latex);
          }
        },
        enter: () => {
          props.onEnter?.();
        },
        upOutOf: () => {
          props.onUpOutOf?.();
        },
        downOutOf: () => {
          props.onDownOutOf?.();
        },
        moveOutOf: (dir) => {
          props.onMoveOutOf?.(dir);
        },
        deleteOutOf: (dir) => {
          props.onDeleteOutOf?.(dir);
        },
      },
    });

    // Add focus/blur event listeners to the underlying element
    // MathQuill doesn't have built-in focus/blur handlers, so we use DOM events
    handleFocus = () => {
      props.onFocus?.();
    };

    handleBlur = () => {
      props.onBlur?.();
    };

    fieldRef.addEventListener('focusin', handleFocus);
    fieldRef.addEventListener('focusout', handleBlur);

    mqInstance = MQ;

    // Set initial value if provided
    if (props.value) {
      mqInstance.latex(props.value);
    }

    // Focus if requested
    if (props.autofocus) {
      mqInstance.focus();
    }
  });

  // Update latex when prop changes
  createEffect(() => {
    if (mqInstance && props.value !== undefined && mqInstance.latex() !== props.value) {
      mqInstance.latex(props.value);
    }
  });

  // Expose methods via ref
  createEffect(() => {
    if (props.ref && mqInstance) {
      props.ref({
        latex: (value) => {
          if (value !== undefined) {
            mqInstance.latex(value);
          }
          return mqInstance.latex();
        },
        focus: () => mqInstance.focus(),
        blur: () => mqInstance.blur(),
        write: (latex) => mqInstance.write(latex),
        cmd: (cmd) => mqInstance.cmd(cmd),
        select: () => mqInstance.select(),
        clearSelection: () => mqInstance.clearSelection(),
        moveToLeftEnd: () => mqInstance.moveToLeftEnd(),
        moveToRightEnd: () => mqInstance.moveToRightEnd(),
        keystroke: (keys) => mqInstance.keystroke?.(keys),
      });
    }
  });

  onCleanup(() => {
    // Clean up event listeners
    if (fieldRef && handleFocus && handleBlur) {
      fieldRef.removeEventListener('focusin', handleFocus);
      fieldRef.removeEventListener('focusout', handleBlur);
    }
  });

  return <span ref={fieldRef} class={props.class} style={props.style} />;
}

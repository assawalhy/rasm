import { createEffect, onCleanup, onMount } from 'solid-js';
import { mathQuill } from '@/utils/mathQuill';

/**
 * MathField wrapper component for MathQuill integration
 * This is the only component that uses jQuery (required by MathQuill)
 */
export default function MathField(props) {
  let fieldRef;
  let mathField;
  let handleFocus;
  let handleBlur;

  onMount(() => {
    // Initialize MathQuill
    mathField = mathQuill.MathField(fieldRef, {
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
          if (mathField) {
            const latex = mathField.latex();
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

    // Set initial value if provided
    if (props.value) {
      mathField.latex(props.value);
    }

    // Focus if requested
    if (props.autofocus) {
      mathField.focus();
    }
  });

  // Update latex when prop changes
  createEffect(() => {
    if (mathField && props.value !== undefined && mathField.latex() !== props.value) {
      mathField.latex(props.value);
    }
  });

  // Expose methods via ref
  createEffect(() => {
    if (props.ref && mathField) {
      props.ref({
        latex: (value) => {
          if (value !== undefined) {
            mathField.latex(value);
          }
          return mathField.latex();
        },
        focus: () => mathField.focus(),
        blur: () => mathField.blur(),
        write: (latex) => mathField.write(latex),
        cmd: (cmd) => mathField.cmd(cmd),
        select: () => mathField.select(),
        clearSelection: () => mathField.clearSelection(),
        moveToLeftEnd: () => mathField.moveToLeftEnd(),
        moveToRightEnd: () => mathField.moveToRightEnd(),
        keystroke: (keys) => mathField.keystroke?.(keys),
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

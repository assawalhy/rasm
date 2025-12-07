import { createStore } from 'solid-js/store';

/**
 * Global controls store for managing graph element controls
 */
const [controls, setControls] = createStore({
  list: [],
  focused: null,
  keypadSettings: {
    focusedControl: null,
    mathField: null,
    visible: false,
  },
});

/**
 * Create a new control object
 * @param {Object} options - Optional initial values
 * @returns {Object} New control object
 */
function createControl(options = {}) {
  return {
    id: options.id || generateControlId(),
    latex: options.latex || '',
    graphChild: options.graphChild || null,
    parsedScript: null,
    vars: [],
    funcs: [],
    validLatex: options.latex || '',
    validParsedScript: null,
    validVars: [],
    validFuncs: [],
    isError: false,
    errorMessage: '',
  };
}

/**
 * Add a new control to the list
 * @param {Object} control - Control object (or creates new if not provided)
 * @param {number} index - Optional index to insert at
 */
function addControl(control, index) {
  const newControl = control?.id ? control : createControl(control);

  setControls('list', (list) => {
    if (typeof index === 'number' && index >= 0 && index < list.length) {
      const newList = [...list];
      newList.splice(index, 0, newControl);
      return newList;
    }
    return [...list, newControl];
  });

  return newControl;
}

/**
 * Update a control by ID
 * @param {string} id - Control ID
 * @param {Object} updates - Properties to update
 */
function updateControl(id, updates) {
  setControls('list', (control) => control.id === id, updates);
}

/**
 * Get a control by ID
 * @param {string} id - Control ID
 * @returns {Object|undefined} The control or undefined
 */
function getControlById(id) {
  return controls.list.find((c) => c.id === id);
}

/**
 * Remove a control by ID
 */
function removeControl(id) {
  setControls('list', (list) => {
    const controlToRemove = list.find((c) => c.id === id);
    if (controlToRemove?.graphChild) {
      controlToRemove.graphChild.remove();
    }
    return list.filter((c) => c.id !== id);
  });
}

/**
 * Focus a control
 */
function focusControl(id) {
  setControls('focused', id);
  setControls('keypadSettings', 'focusedControl', id);
}

/**
 * Blur the currently focused control
 */
function blurControl() {
  setControls('focused', null);
  setControls('keypadSettings', 'focusedControl', null);
}

/**
 * Toggle keypad visibility
 */
function toggleKeypad(visible) {
  setControls('keypadSettings', 'visible', visible ?? !controls.keypadSettings.visible);
}

/**
 * Set the mathField reference for keypad input
 */
function setMathField(mathField) {
  setControls('keypadSettings', 'mathField', mathField);
}

/**
 * Generate a unique control ID
 * @returns {string}
 */
function generateControlId() {
  return (Date.now() + generateControlId.counter++).toString(36).replace(/\d/g, (num) => {
    return String.fromCharCode(97 + Number.parseInt(num));
  });
}
generateControlId.counter = 0;

export {
  controls,
  setControls,
  createControl,
  addControl,
  updateControl,
  getControlById,
  removeControl,
  focusControl,
  blurControl,
  toggleKeypad,
  setMathField,
  generateControlId
};

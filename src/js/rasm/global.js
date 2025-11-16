import ChildControl from './ChildControl.js';
import sketch from './sketch.js';

const canvasParent = sketch.canvas.parent;
const math = MathPackage.Core;

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

  checkScreenType();

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

export function checkScreenType() {
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
checkScreenType.prevSize = { width: window.innerWidth, height: window.innerHeight };

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

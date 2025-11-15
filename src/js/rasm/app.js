import ChildControl from './ChildControl.js';
import setEvents from './events/index.js';
import { addControl, checkSM, getContainment, keypadSettings, resize, sidebar, updateObjsOrder } from './global.js';
import setupKeypad from './keypad/index.js';
import sketch from './sketch.js';

function setupResizer() {
  //#region sidebar-resizer

  const sidebarResizer = sidebar.querySelector('.resizer');
  const srDraggingConfig = {}; // sidebarResizerDraggingConfig

  $(sidebarResizer).draggable({
    axis: 'x',
    containment: getContainment(sidebar),

    start: (e) => {
      sidebarResizer.classList.add('dragging');
      srDraggingConfig.intialWidth = sidebar.clientWidth;
      srDraggingConfig.intialOffset = e.pageX;
      srDraggingConfig.cursor = document.body.style.cursor;
      document.body.style.cursor = 'e-resize';
    },

    stop: () => {
      sidebarResizer.classList.remove('dragging');
      sidebar.style.flexBasis = sidebarResizer.style.left;
      document.body.style.cursor = srDraggingConfig.cursor;
    },

    drag: () => {
      sidebar.style.flexBasis = sidebarResizer.style.left;
      resize(false);
    },
  });

  //#endregion
}

function setupSortable() {
  //#region sortable-sidebar

  const outer_ccc = document.querySelector('.outer-controls');
  const inner_ccc = outer_ccc.querySelector('.inner-controls');

  let startSorting = true;
  $('.controls.sortable').sortable({
    axis: 'y',
    cancel: '.control [cancel-move]',

    start: (e, ui) => {
      startSorting = true;
      outer_ccc.classList.add('sorting');
      if (inner_ccc.clientHeight > outer_ccc.clientHeight) {
        outer_ccc.style.overflowY = 'scroll';
      }

      ui.item[0].classList.add('dragging');
      const id = ui.item[0].getAttribute('id');
      for (const child in sketch.children) {
        if (child.id === id) {
          child.focus();
        }
      }
    },

    stop: (e, ui) => {
      if (startSorting) {
        outer_ccc.classList.remove('sorting');
        outer_ccc.style.overflowY = 'auto';
        ui.item[0].classList.remove('dragging');
      } else {
        startSorting = false;
      }
    },

    update: () => {
      updateObjsOrder();
    },
  });
  $('.controls.sortable').disableSelection();

  //#endregion
}

/**
 * """""""""""""""" reminder
 * app folder is associated with RASM folder, both of them depends upon the other.
 */
export default function setupAPP() {
  // document.body.style.height = window.innerHeight + 'px';

  window.MQ = MathQuill.getInterface(2);
  MQ.config({
    sumStartsWithNEquals: true,
    supSubsRequireOperand: true,
    // charsThatBreakOutOfSupSub: '+-=<>',
    autoSubscriptNumerals: true,
    autoCommands: 'pi theta sqrt abs floor ceil round random sum int prod',
    // // autoOperatorNames: '',
    maxDepth: 10,
  });

  resize.prevSize = { width: 1000, height: 1000 }; /// the app is desined upon the large screen so this should be the default
  checkSM();
  resize.prevSize = { width: window.innerWidth, height: window.innerHeight };

  const mathFields = $('.math-field');
  for (let i = 0; i < mathFields.length; i++) {
    MQ.StaticMath(mathFields[i]);
  }

  const addNewGCelt = $(`
      <li class="control">
        <div class="side-status" cancel-move>
          <div class="order-container">
            <span class='order'>123</span>
          </div>
        </div>
        <div class="main" cancel-move cancel-hiding-keypad>
          <div class=script-container><span type="text" class="script">NEW</span></div>
        </div>
        <div class="side-ctrl">
          <span class="move">
            <div>
              <span>..</span>
              <span>..</span>
              <span>..</span>
            </div>
          </span>
        </div>
      </li>
      `)[0];
  document.body.querySelector('#add-new-control').append(addNewGCelt);

  setEvents();
  setupKeypad();

  setupResizer();
  setupSortable();

  resize();
  sketch.gs.centrate();
  sketch.update();

  console.log('%RASM', 'background: black; color: white; font: 50px consolas;');
  console.log('%cWe are sciCave', 'color: blue; font: 25px consolas;');

  addControl(new ChildControl());
}

import ChildControl from '../ChildControl.js';
import { addControl, checkSM, keypadSettings, resize, sidebar } from '../global.js';
import canvasEvents from './canvasEvents.js';
import toolsEvents from './toolsEvents.js';

export default function setEvents() {
  //#region window events
  window.addEventListener('resize', resize);
  window.addEventListener('mouseup', (event) => {
    //#region for backspace interval
    if (keypadSettings.mouseDownForInterval) {
      keypadSettings.mouseDownForInterval = false;
      clearInterval(keypadSettings.backspaceInterval);
    }
    //#endregion
    keypadSettings.hideKeyPad = true;
  });
  window.addEventListener('touchend', (event) => {
    //#region for backspace interval
    if (keypadSettings.mouseDownForInterval) {
      keypadSettings.mouseDownForInterval = false;
      clearInterval(keypadSettings.backspaceInterval);
    }
    //#endregion
    keypadSettings.hideKeyPad = true;
  });
  window.addEventListener('mousedown', (e) => {
    //#region hide keybad
    const keypadShown = /\svisible\s|^visible\s|\svisible$/.test(keypadSettings.showHideKeyBtn.className); // hasClass
    if (keypadSettings.hideKeyPad && keypadShown) {
      keypadSettings.showHideKeyBtn.click();
    }
    //#endregion
  });
  window.addEventListener('touchstart', (e) => {
    //#region hide keybad
    const keypadShown = /\svisible\s|^visible\s|\svisible$/.test(keypadSettings.showHideKeyBtn.className); // hasClass
    if (keypadSettings.hideKeyPad && keypadShown) {
      keypadSettings.showHideKeyBtn.click();
    }
    //#endregion
  });
  //#endregion

  document.querySelector('#add-new-control').addEventListener('click', (e) => {
    addControl(new ChildControl());
  });

  document.querySelector('#show-hide-sidebar').addEventListener('click', function (e) {
    const $this = $(this);
    const __visible = $this.hasClass('visible');
    const from = __visible ? 'visible' : 'unvisible';
    const to = __visible ? 'unvisible' : 'visible';

    // let path = this.querySelector('path');
    if (__visible) {
      document.body.querySelector('.app-container').appendChild(this);
    } else {
      sidebar.querySelector('.header').append(this);
    }

    $this.removeClass(from);
    $this.addClass(to);

    sidebar.classList.remove(from);
    sidebar.classList.add(to);

    resize();
  });

  canvasEvents();
  toolsEvents();
}

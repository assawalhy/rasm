import { checkSM, keypadSettings, resize, sidebar } from '../global.js';
import keypadEvents from './events.js';

export default function setupKeypad() {
  keypadSettings.showHideKeyBtn.addEventListener('click', function (e) {
    const sidebarShown = /\svisible\s|^visible\s|\svisible$/.test(sidebar.className); // hasClass
    if (!sidebarShown) {
      document.querySelector('#show-hide-sidebar').click();
    }
    const parent = document.querySelector('.keypad-container');
    const $this = $(this);
    const __keypadShown = $this.hasClass('visible');
    const from = __keypadShown ? 'visible' : 'unvisible';
    const to = __keypadShown ? 'unvisible' : 'visible';

    keypadSettings.showHideKeyBtn.classList.remove(from);
    keypadSettings.showHideKeyBtn.classList.add(to);

    parent.classList.remove(from);
    parent.classList.add(to);
    if (__keypadShown) {
      document.body.querySelector('.app-container').appendChild(keypadSettings.showHideKeyBtn);
    } else {
      parent.insertBefore(keypadSettings.showHideKeyBtn, parent.firstElementChild);
    }
    if (checkSM.smallScreen) {
      resize();
    }

    keypadSettings.focusedControl.focus();
  });

  SUI.tabs(document.body.querySelector('.keypad-container .tabs-1'));

  keypadEvents();
}

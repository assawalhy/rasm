import ChildControl from '../ChildControl.js';
import { addControl, keypadSettings } from '../global.js';

export default function () {
  //#region (keypad - showHideBtn) events
  const keypad = $('.keypad-container');
  const sh = $(keypadSettings.showHideKeyBtn);

  keypad.bind('focusin', () => {
    keypadSettings.mathField.focus();
  });

  $(document.body).delegate('[cancel-hiding-keypad]', 'mousedown touchstart', (e) => {
    keypadSettings.hideKeyPad = false;
  });

  $('.control').delegate('.main', 'touchstart', (e) => {
    if (sh.hasClass('hide')) {
      sh.click();
    }
  });
  //#endregion

  //#region writing

  $('.keypad-container .rows button[mq-cmd]').each(function (index) {
    $(this).on('click', function () {
      const $this = $(this);
      if ($this.hasClass('double-shiftable')) {
        keypadSettings.mathField.cmd($(' > div.active > span.active', $this).attr('mq-cmd'));
      } else if ($this.hasClass('shiftable')) {
        keypadSettings.mathField.cmd($(' > span.active', $this).attr('mq-cmd'));
      } else {
        keypadSettings.mathField.cmd(this.getAttribute('mq-cmd'));
      }
      keypadSettings.focusedControl.focus();
    });
  });

  $('.keypad-container .rows button[mq-write]').each(function (index) {
    $(this).on('click', function () {
      const $this = $(this);
      if ($this.hasClass('double-shiftable')) {
        keypadSettings.mathField.write($(' > div.active > span.active', $this).attr('mq-write'));
      } else if ($this.hasClass('shiftable')) {
        keypadSettings.mathField.write($(' > span.active', $this).attr('mq-write'));
      } else {
        keypadSettings.mathField.write(this.getAttribute('mq-write'));
      }
      keypadSettings.focusedControl.focus();
    });
  });

  $('.keypad-container .rows button[mq-func]').each(function (index) {
    $(this).on('click', function () {
      const $this = $(this);
      if ($this.hasClass('double-shiftable')) {
        keypadSettings.mathField.write($(' > div.active > span.active', $this).attr('mq-func'));
      } else if ($this.hasClass('shiftable')) {
        keypadSettings.mathField.write($(' > span.active', $this).attr('mq-func'));
      } else {
        keypadSettings.mathField.write(this.getAttribute('mq-func'));
      }
      keypadSettings.mathField.cmd('(');
      keypadSettings.focusedControl.focus();
    });
  });

  $('.space').on('click', () => {
    keypadSettings.mathField.keystroke('Right');
  });

  //keystrokes
  $('.backspace').on('mousedown', () => {
    if (keypadSettings.mathField.latex() === '') {
      keypadSettings.focusedControl.remove();
    } else {
      keypadSettings.mathField.keystroke('Backspace');
    }

    //#region for keep backSpace on holing the button

    keypadSettings.mouseDownForInterval = true;
    setTimeout(() => {
      if (keypadSettings.mouseDownForInterval) {
        keypadSettings.backspaceInterval = setInterval(() => {
          keypadSettings.mathField.keystroke('Backspace');
        }, 120);
      }
    }, 400);

    //#endregion
  });

  //#endregion

  //#region direction

  $('.go-left').on('click', () => {
    keypadSettings.mathField.keystroke('Left');
  });

  $('.go-right').on('click', () => {
    keypadSettings.mathField.keystroke('Right');
  });

  $('.go-up').on('click', () => {
    keypadSettings.mathField.keystroke('Up');
  });

  $('.go-down').on('click', () => {
    keypadSettings.mathField.keystroke('Down');
  });

  $('.enter').on('click', () => {
    addControl(new ChildControl(), Number.parseInt(keypadSettings.focusedControl.orderELT.textContent));
  });

  //#endregion

  //#region shift - double-shift

  const shift = $('.shift');
  shift.on('click', function () {
    const $this = $(this);
    const rows = $this.parents('.rows');
    if ($this.hasClass('active')) {
      $this.removeClass('active');
      $this.addClass('lock');
      rows.removeClass('shift-active');
      rows.addClass('shift-lock');
    } else {
      if ($this.hasClass('lock')) {
        const spans = $('.shiftable > span, .double-shiftable > div > span', rows);
        spans.toggleClass('active');
        $this.removeClass('lock');
        rows.removeClass('shift-lock');
      } else {
        const spans = $('.shiftable > span, .double-shiftable > div > span', rows);
        spans.toggleClass('active');
        $this.addClass('active');
        rows.addClass('shift-active');
      }
    }
  });

  // this for disabling shift if it is not .lock
  $('.keypad-container .rows button')
    .not('.shift, .double-shift')
    .on('click', function () {
      const $this = $(this);
      const rows = $this.parents('.rows');
      if (rows.hasClass('shift-active')) {
        const shift = $('button.shift', rows);
        const spans = $('.shiftable > span, .double-shiftable > div > span', rows);
        spans.toggleClass('active');
        shift.removeClass('active');
        rows.removeClass('shift-active');
      }
    });

  const dShift = $('.double-shift');
  dShift.on('click', function () {
    const $this = $(this);
    const divs = $('.double-shiftable > div', $this.parents('.rows'));
    divs.toggleClass('active');
    $this.toggleClass('active');
  });

  //#endregion
}

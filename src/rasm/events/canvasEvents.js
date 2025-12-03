import drawing from '../../core/drawing/index.js';
import { mouse, subTools } from '../global.js';
import sketch from '../sketch.js';

import { Vector, Angles, Core } from "~/math";

export default function canvasEvents() {
  const canvas = sketch.canvas;
  const canvasParent = canvas.parent;

  let mousepressed;
  const lines = Lines;
  let dragInterval;

  const startTransFunc = (e) => {
    mousepressed = true;

    /// the mouse position
    const canvasPos = getPosittion(canvas.elt);
    if (e.type === 'mousedown') {
      mouse.x = e.clientX - canvasPos.left;
      mouse.y = e.clientY - canvasPos.top;
    } else {
      //touchstart
      const touch = e.touches[0];
      mouse.x = touch.clientX - canvasPos.left;
      mouse.y = touch.clientY - canvasPos.top;
    }

    Object.assign(subTools, {
      type: subTools.type,
      mouse: new Vector(mouse.x, mouse.y),
      iVector: sketch.gs.transform.iVector,
      jVector: sketch.gs.transform.jVector,
    });

    if (subTools.type === 'move') {
      // canvasParent.style.cursor = 'grabbing';
      // canvasParent.style.cursor = '-webkit-grabbing';
      mouse.prev = { x: mouse.x, y: mouse.y };
      mouse.vel = { x: 0, y: 0 };
      clearInterval(dragInterval);
      // dragInterval = setInterval(() => {
      //    // mouse.prevVel = mouse.vel;
      //    mouse.vel = { x: mouse.x - mouse.prev.x, y: mouse.y - mouse.prev.y };
      //    // mouse.acc = { x: mouse.vel.x - mouse.prevVel.x, y: mouse.vel.y - mouse.prevVel.y };
      //    mouse.prev = { x: mouse.x, y: mouse.y };
      // }, 20);
    } else if (subTools.type.search('axises') > -1) {
      // canvasParent.style.cursor = 'grabbing';
      // canvasParent.style.cursor = '-webkit-grabbing';
      const xEq = lines.lineEquation(-sketch.gs.transform.xAngle, sketch.gs.center);
      const yEq = lines.lineEquation(-sketch.gs.transform.yAngle, sketch.gs.center);
      const d = 30;
      const distTo = {
        x: lines.distToLine(subTools.mouse, xEq),
        y: lines.distToLine(subTools.mouse, yEq),
      };
      if (distTo.x < d && distTo.y < d) {
        subTools.axis = 'xy';
        subTools.xSpace = sketch.gs.transform.xSapce;
        subTools.ySpace = sketch.gs.transform.ySapce;
        subTools.xAngle = sketch.gs.transform.xAngle;
        subTools.yAngle = sketch.gs.transform.yAngle;
        subTools.transformOrigin = new Vector(sketch.gs.center.x, sketch.gs.center.y);
        subTools.xPenColor = Object.assign(new drawing.color(), sketch.coor.coorSettings.penXaxis.color);
        subTools.yPenColor = Object.assign(new drawing.color(), sketch.coor.coorSettings.penYaxis.color);
        sketch.coor.coorSettings.penXaxis.color = new drawing.color(255, 0, 0, 155);
        sketch.coor.coorSettings.penYaxis.color = new drawing.color(255, 0, 0, 155);
      } else if (distTo.x < d) {
        subTools.axis = 'x';
        subTools.space = sketch.gs.transform.xSapce;
        subTools.angle = sketch.gs.transform.xAngle;
        let o = new Vector(
          Core.constrain(sketch.gs.center.x, 0, sketch.gs.width),
          Core.constrain(sketch.gs.center.y, 0, sketch.gs.height),
        );
        if (o.x !== sketch.gs.center.x) {
          o = subTools.mouse;
        }
        subTools.transformOrigin = o;
        subTools.penColor = [sketch.coor.coorSettings.penXaxis.color].slice()[0];
        sketch.coor.coorSettings.penXaxis.color = new drawing.color(255, 0, 0, 155);
      } else if (distTo.y < d) {
        subTools.axis = 'y';
        subTools.space = sketch.gs.transform.ySapce;
        subTools.angle = sketch.gs.transform.yAngle;
        let o = new Vector(
          Core.constrain(sketch.gs.center.x, 0, sketch.gs.width),
          Core.constrain(sketch.gs.center.y, 0, sketch.gs.height),
        );
        if (o.y !== sketch.gs.center.y) {
          o = subTools.mouse;
        }
        subTools.transformOrigin = o;
        subTools.penColor = [sketch.coor.coorSettings.penYaxis.color].slice()[0];
        sketch.coor.coorSettings.penYaxis.color = new drawing.color(255, 0, 0, 155);
      } else {
        subTools.axis = undefined;
      }
      subTools.increment = 0;
      sketch.draw();
    } else if (subTools.type === 'zoom') {
      // canvasParent.style.cursor = 'grabbing';
      /// setting the layer of zoomBox
      const boxElt = document.createElement('div');
      boxElt.classList.add('zoom-box');
      // boxElt.setAttribute('style', `--top: 0;--left: 0;--width: 0;--height: 0;`);
      canvasParent.append(boxElt);
      subTools.boxElt = boxElt;
      subTools.pxViewport = {};
    }
    e.preventDefault();
  };

  canvasParent.addEventListener('mousedown', startTransFunc);
  canvasParent.addEventListener('touchstart', startTransFunc);

  const updateTransFunc = (e) => {
    //#region getting positions of mouse

    if (mousepressed) {
      const canvasPos = getPosittion(canvas.elt);
      if (e.type === 'mousemove') {
        mouse.x = e.clientX - canvasPos.left;
        mouse.y = e.clientY - canvasPos.top;
      } else {
        //touchstart
        const touch = e.touches[0];
        mouse.x = touch.clientX - canvasPos.left;
        mouse.y = touch.clientY - canvasPos.top;
      }

      switch (subTools.type) {
        case 'move': {
          moveCoor(e);
          break;
        }
        case 'scale-axises': {
          scaleAxises(e);
          break;
        }
        case 'rotate-axises': {
          rotateAxises(e);
          break;
        }
        case 'zoom': {
          zoomBox(e);
          break;
        }
      }
      e.preventDefault();
    }
  };

  window.addEventListener('mousemove', updateTransFunc, true);
  window.addEventListener('touchmove', updateTransFunc, { passive: false, capture: true });

  function getPosittion(elt) {
    let parentPos = { left: 0, top: 0 };
    if (elt.offsetParent) {
      parentPos = getPosittion(elt.offsetParent);
    }
    return { left: elt.offsetLeft + parentPos.left, top: elt.offsetTop + parentPos.top };
  }

  const transEndFunc = (e) => {
    if (mousepressed) {
      mousepressed = false;
      if (subTools.type === 'move') {
        // canvasParent.style.cursor = 'grab';
        // canvasParent.style.cursor = '-webkit-grab';
        clearInterval(dragInterval);
        mouse.vel = new Vector(mouse.vel.x, mouse.vel.y);
        while (mouse.vel.mag > 50) {
          mouse.vel = mouse.vel.mult(0.9);
        }
        dragInterval = setInterval(() => {
          if (mouse.vel.mag > 1) {
            mouse.vel = mouse.vel.mult(0.9);
          }
          sketch.gs.transform.translate(mouse.vel);
          sketch.update();
          if (mouse.vel.mag <= 1) clearInterval(dragInterval);
        }, 10);
      } else if (subTools.type.search('axises') > -1) {
        // canvasParent.style.cursor = 'grab';
        // canvasParent.style.cursor = '-webkit-grab';
        if (subTools.axis === 'x') {
          sketch.coor.coorSettings.penXaxis.color = subTools.penColor;
        } else if (subTools.axis === 'y') {
          sketch.coor.coorSettings.penYaxis.color = subTools.penColor;
        } else if (subTools.axis === 'xy') {
          sketch.coor.coorSettings.penXaxis.color = subTools.xPenColor;
          sketch.coor.coorSettings.penYaxis.color = subTools.yPenColor;
        }
        sketch.draw();
      } else if (subTools.type === 'zoom') {
        subTools.boxElt.remove();
        if (subTools.pxViewport.width && subTools.pxViewport.height) {
          sketch.gs.transform.transformOrigin = undefined;
          sketch.gs.transform.setViewport(sketch.gs.transform.getViewport(subTools.pxViewport));
        }
        showTransDetails(
          [
            'x: {',
            `  xmin: ${sketch.gs.viewport.xmin},`,
            `  xmax: ${sketch.gs.viewport.xmax}`,
            '},',
            'y: {',
            `  ymin: ${sketch.gs.viewport.ymin},`,
            `  ymax: ${sketch.gs.viewport.ymax}`,
            '}',
          ],
          'zoom',
        );
        sketch.update();
      }
    }
  };

  window.addEventListener('mouseup', transEndFunc);
  window.addEventListener('touchend', transEndFunc);

  canvasParent.addEventListener('mousewheel', (e) => {
    e.preventDefault();

    const canvasPos = getPosittion(canvas.elt);
    mouse.x = e.clientX - canvasPos.left;
    mouse.y = e.clientY - canvasPos.top;

    const center = sketch.gs.center;
    let mousePos = mouse;
    if (Core.dist(mouse.x, mouse.y, center.x, center.y) < 30) {
      mousePos = center;
    }
    if (e.wheelDelta > 0) {
      sketch.gs.transform.zoomIn(new Vector(mousePos.x, mousePos.y));
      sketch.update();
    } else {
      sketch.gs.transform.zoomOut(new Vector(mousePos.x, mousePos.y));
      sketch.update();
    }
  });

  //#region mouse move (tools'-subtools') functions

  function moveCoor(e) {
    sketch.gs.transform.translate(new Vector(mouse.x, mouse.y).subtract(subTools.mouse));
    sketch.update();
    // canvas.ellipse(mouse.x, mouse.y, 5);
    subTools.mouse = new Vector(mouse.x, mouse.y);
  }

  function scaleAxises(e) {
    if (subTools.axis === 'x') {
      const rotatedMouse = subTools.mouse;
      const xEq = lines.lineEquation(-sketch.gs.transform.xAngle, sketch.gs.center);
      const incre =
        (Core.dist(mouse.x, mouse.y, rotatedMouse.x, rotatedMouse.y) ** 2 -
          lines.distToLine(new Vector(mouse.x, mouse.y), xEq) ** 2) **
        0.5;

      sketch.gs.transform.transformOrigin = undefined;
      if (!Number.isNaN(incre)) {
        const mina = Angles.minAngle(
          Vector.fromAngle(-sketch.gs.transform.xAngle),
          new Vector(mouse.x, mouse.y).subtract(rotatedMouse),
        );
        const dir = mina < Math.PI / 2 ? 1 : mina > Math.PI / 2 ? -1 : 0;

        sketch.gs.transform.transformOrigin = subTools.transformOrigin;
        sketch.gs.transform.xSpace += incre * dir - subTools.increment;
        sketch.gs.transform.reformXspace();
        subTools.increment = incre * dir;
      }

      sketch.gs.transform.onchange(true);
      sketch.update();
      // canvas.ellipse(rotatedMouse.x, rotatedMouse.y, 5);
      // canvas.ellipse(mouse.x, mouse.y, 5);

      showTransDetails([`*${(sketch.gs.iVector.mag / subTools.iVector.mag).toFixed(2)}`]);
    } else if (subTools.axis === 'y') {
      const rotatedMouse = subTools.mouse;
      const yEq = lines.lineEquation(-sketch.gs.transform.yAngle, sketch.gs.center);
      const incre =
        (Core.dist(mouse.x, mouse.y, rotatedMouse.x, rotatedMouse.y) ** 2 -
          lines.distToLine(new Vector(mouse.x, mouse.y), yEq) ** 2) **
        0.5;

      sketch.gs.transform.transformOrigin = undefined;
      if (!Number.isNaN(incre)) {
        const mina = Angles.minAngle(
          Vector.fromAngle(-sketch.gs.transform.yAngle),
          new Vector(mouse.x, mouse.y).subtract(rotatedMouse),
        );
        const dir = mina < Math.PI / 2 ? 1 : mina > Math.PI / 2 ? -1 : 0;

        sketch.gs.transform.transformOrigin = subTools.transformOrigin;
        sketch.gs.transform.ySpace += incre * dir - subTools.increment;
        sketch.gs.transform.reformYspace();
        subTools.increment = incre * dir;
      }

      sketch.gs.transform.onchange(true);
      sketch.update();
      // canvas.ellipse(rotatedMouse.x, rotatedMouse.y, 5);
      // canvas.ellipse(mouse.x, mouse.y, 5);
      showTransDetails([`*${(sketch.gs.jVector.mag / subTools.jVector.mag).toFixed(2)}`]);
    } else if (subTools.axis === 'xy') {
      const midEq = lines.lineEquation(
        -(sketch.gs.transform.yAngle + sketch.gs.transform.xAngle) / 2,
        sketch.gs.center,
      );
      const rotatedMouse = lines.projectionToLine(subTools.mouse, midEq); // rotatedMouse here is the modified start point which sets on the line between x and y axises

      const incre =
        (Core.dist(mouse.x, mouse.y, rotatedMouse.x, rotatedMouse.y) ** 2 -
          lines.distToLine(new Vector(mouse.x, mouse.y), midEq) ** 2) **
        0.5; // pathagorean's method

      sketch.gs.transform.transformOrigin = undefined;
      if (!Number.isNaN(incre)) {
        const mina = Angles.minAngle(
          Vector.fromAngle(-sketch.gs.transform.yAngle),
          new Vector(mouse.x, mouse.y).subtract(rotatedMouse),
        );
        const dir = mina < Math.PI / 2 ? 1 : mina > Math.PI / 2 ? -1 : 0;

        sketch.gs.transform.transformOrigin = subTools.transformOrigin;
        let ratio = (sketch.gs.transform.ySpace + (incre * dir - subTools.increment)) / sketch.gs.transform.ySpace;
        ratio = Core.constrain(ratio, 0.9, 1.1);
        sketch.gs.transform.ySpace *= ratio;
        sketch.gs.transform.xSpace *= ratio;
        sketch.gs.transform.reformYspace();
        sketch.gs.transform.reformXspace();
        subTools.increment = incre * dir;
      }

      sketch.gs.transform.onchange(true);
      sketch.update();
      // canvas.ellipse(rotatedMouse.x, rotatedMouse.y, 5);
      // canvas.ellipse(mouse.x, mouse.y, 5);
      showTransDetails([`*${(sketch.gs.jVector.mag / subTools.jVector.mag).toFixed(2)}`]);
    }
  }

  function rotateAxises(e) {
    if (subTools.axis === 'x') {
      if (Core.dist(sketch.gs.center.x, sketch.gs.center.y, mouse.x, mouse.y) > 10) {
        let rotatedMouse = subTools.mouse;
        let rotationAngle = Angles.angle(
          subTools.mouse.subtract(new Vector(sketch.gs.center.x, sketch.gs.center.y)),
          new Vector(mouse.x, mouse.y).subtract(new Vector(sketch.gs.center.x, sketch.gs.center.y)),
        );
        rotationAngle = Angles.constrainAngle(rotationAngle);
        if (!Number.isNaN(rotationAngle)) {
          // sketch.gs.transform.xAngle = snapAngle(subTools.angle - rotationAngle);
          sketch.gs.transform.xAngle = Angles.snapAngle(subTools.angle - rotationAngle, [0, Math.PI]);
          const center = sketch.gs.center;
          rotatedMouse = center.add(subTools.mouse.subtract(center).rotate(rotationAngle));
        }

        sketch.gs.transform.transformOrigin = undefined;
        sketch.gs.transform.invokeOnchange = true;
        sketch.gs.transform.onchange();
        sketch.update();

        // canvas.ellipse(rotatedMouse.x, rotatedMouse.y, 5);
        // canvas.ellipse(mouse.x, mouse.y, 5);
        showTransDetails([
          `xAngle: ${Angles.stringDegAngle(sketch.gs.transform.xAngle.toFixed(2))}`,
          `rotationAngle: ${Angles.stringDegAngle(-rotationAngle)}`,
        ]);
      }
    } else if (subTools.axis === 'y') {
      if (Core.dist(sketch.gs.center.x, sketch.gs.center.y, mouse.x, mouse.y) > 10) {
        let rotatedMouse = subTools.mouse;
        let rotationAngle = Angles.angle(
          subTools.mouse.subtract(new Vector(sketch.gs.center.x, sketch.gs.center.y)),
          new Vector(mouse.x, mouse.y).subtract(new Vector(sketch.gs.center.x, sketch.gs.center.y)),
        );
        rotationAngle = Angles.constrainAngle(rotationAngle);
        if (!Number.isNaN(rotationAngle)) {
          sketch.gs.transform.yAngle = Angles.snapAngle(subTools.angle - rotationAngle, [
            Math.PI / 2,
            (3 * Math.PI) / 2,
          ]);
          const center = sketch.gs.center;
          rotatedMouse = center.add(subTools.mouse.subtract(center).rotate(rotationAngle));
        }

        sketch.gs.transform.invokeOnchange = true;
        sketch.gs.transform.onchange();
        sketch.update();
        // canvas.ellipse(rotatedMouse.x, rotatedMouse.y, 5);
        // canvas.ellipse(mouse.x, mouse.y, 5);
        showTransDetails([
          `yAngle: ${Angles.stringDegAngle(sketch.gs.transform.yAngle.toFixed(2))}`,
          `rotationAngle: ${Angles.stringDegAngle(-rotationAngle)}`,
        ]);
      }
    } else if (subTools.axis === 'xy') {
      if (Core.dist(sketch.gs.center.x, sketch.gs.center.y, mouse.x, mouse.y) > 10) {
        let rotatedMouse = subTools.mouse;
        let rotationAngle = Angles.angle(
          subTools.mouse.subtract(new Vector(sketch.gs.center.x, sketch.gs.center.y)),
          new Vector(mouse.x, mouse.y).subtract(new Vector(sketch.gs.center.x, sketch.gs.center.y)),
        );
        rotationAngle = Angles.constrainAngle(rotationAngle);
        if (!Number.isNaN(rotationAngle)) {
          sketch.gs.transform.xAngle = subTools.xAngle - rotationAngle;
          sketch.gs.transform.yAngle = subTools.yAngle - rotationAngle;
          const center = sketch.gs.center;
          rotatedMouse = center.add(subTools.mouse.subtract(center).rotate(rotationAngle));
        }

        sketch.gs.transform.invokeOnchange = true;
        sketch.gs.transform.onchange();
        sketch.update();
        // canvas.ellipse(rotatedMouse.x, rotatedMouse.y, 5);
        // canvas.ellipse(mouse.x, mouse.y, 5);
        showTransDetails([
          `xAngle: ${Angles.stringDegAngle(sketch.gs.transform.xAngle)}`,
          `yAngle: ${Angles.stringDegAngle(sketch.gs.transform.yAngle)}`,
          `rotationAngle: ${Angles.stringDegAngle(-rotationAngle)}`,
        ]);
      }
    }
  }

  function zoomBox(e) {
    //#region calculating box
    let s = { xmin: subTools.mouse.x, ymin: subTools.mouse.y, xmax: mouse.x, ymax: mouse.y };

    subTools.pxViewport.xmin = Math.min(s.xmin, s.xmax);
    subTools.pxViewport.ymin = Math.min(s.ymin, s.ymax);
    subTools.pxViewport.xmax = Math.max(s.xmin, s.xmax);
    subTools.pxViewport.ymax = Math.max(s.ymin, s.ymax);
    subTools.pxViewport.width = subTools.pxViewport.xmax - subTools.pxViewport.xmin;
    subTools.pxViewport.height = subTools.pxViewport.ymax - subTools.pxViewport.ymin;
    s = subTools.pxViewport;
    let slice;
    if (s.width < 10 && s.height < 10) {
      s.width = 0;
      s.height = 0;
    }
    // reserved ratios
    if (document.querySelector('#subtools-zoom-rr').checked || e.shiftKey) {
      const a = Angles.minAngle(Vector.fromAngle(0), new Vector(sketch.gs.width, sketch.gs.height));
      const equ = lines.lineEquation(a, subTools.mouse);
      const p = lines.projectionToLine(new Vector(mouse.x, mouse.y), equ);
      s = { xmin: subTools.mouse.x, ymin: subTools.mouse.y, xmax: Math.round(p.x), ymax: Math.round(p.y) };
      subTools.pxViewport.xmin = Math.min(s.xmin, s.xmax);
      subTools.pxViewport.ymin = Math.min(s.ymin, s.ymax);
      subTools.pxViewport.xmax = Math.max(s.xmin, s.xmax);
      subTools.pxViewport.ymax = Math.max(s.ymin, s.ymax);
      subTools.pxViewport.width = subTools.pxViewport.xmax - subTools.pxViewport.xmin;
      subTools.pxViewport.height = subTools.pxViewport.ymax - subTools.pxViewport.ymin;
      s = subTools.pxViewport;
    } else {
      subTools.boxElt.classList.remove('v');
      subTools.boxElt.classList.remove('h');
      if (s.height < 10 && s.width > 10) {
        slice = { type: 'v' };
        subTools.boxElt.classList.add('v');
        s.ymin = 0;
        s.ymax = sketch.gs.height;
        s.height = sketch.gs.height;
      } else if (s.height > 10 && s.width < 10) {
        slice = { type: 'h' };
        subTools.boxElt.classList.add('h');
        s.xmin = 0;
        s.xmax = sketch.gs.width;
        s.width = sketch.gs.width;
      }
    }
    //#endregion

    const fadeColor = sketch.coor.coorSettings.background.isDark() ? '#fff5' : '#0005';
    subTools.boxElt.setAttribute(
      'style',
      `--left: ${s.xmin}px; --top: ${s.ymin}px; --width: ${s.width}px; --height: ${s.height}px; --background: ${fadeColor}`,
    );
  }

  /**
   * @param {Array} messeges ::: Array of string which will be converted into p html element
   */
  function showTransDetails(messeges) {
    let html = '<div class="subtools-details">';
    for (const msg of messeges) {
      html += `<p>${msg}</p>`;
    }
    html += '</div>';
    subTools.details.setContent(html);
    subTools.details.show();
  }

  //#endregion
}

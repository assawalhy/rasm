/**
 * Draggable utility - vanilla JS implementation
 * Replaces jQuery UI draggable
 */

export function makeDraggable(element, options = {}) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  const handleMouseDown = (e) => {
    // Check if we should start dragging
    if (options.handle && !e.target.closest(options.handle)) {
      return;
    }

    if (options.cancel && e.target.closest(options.cancel)) {
      return;
    }

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = element.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    element.classList.add('dragging');

    options.start?.(e, { position: { left: initialLeft, top: initialTop } });

    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newLeft = initialLeft + deltaX;
    let newTop = initialTop + deltaY;

    // Apply axis constraint
    if (options.axis === 'x') {
      newTop = initialTop;
    } else if (options.axis === 'y') {
      newLeft = initialLeft;
    }

    // Apply containment
    if (options.containment) {
      const container =
        typeof options.containment === 'string' ? document.querySelector(options.containment) : options.containment;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        newLeft = Math.max(containerRect.left, Math.min(newLeft, containerRect.right - elementRect.width));
        newTop = Math.max(containerRect.top, Math.min(newTop, containerRect.bottom - elementRect.height));
      }
    }

    element.style.left = `${newLeft}px`;
    element.style.top = `${newTop}px`;

    options.drag?.(e, { position: { left: newLeft, top: newTop } });
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;

    isDragging = false;
    element.classList.remove('dragging');

    const rect = element.getBoundingClientRect();
    options.stop?.(e, { position: { left: rect.left, top: rect.top } });
  };

  // Set up event listeners
  element.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  // Make element positioned if not already
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }

  // Return API
  return {
    destroy: () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    },
    disable: () => {
      element.style.pointerEvents = 'none';
    },
    enable: () => {
      element.style.pointerEvents = '';
    },
  };
}

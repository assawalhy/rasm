/**
 * Sortable utility - vanilla JS implementation
 * Replaces jQuery UI sortable
 */

export function makeSortable(element, options = {}) {
  let draggedItem = null;
  const placeholder = null;

  const items = () => element.querySelectorAll(options.items || '> *');

  const createPlaceholder = () => {
    const ph = document.createElement('div');
    ph.className = 'sortable-placeholder';
    ph.style.height = `${draggedItem.offsetHeight}px`;
    ph.style.border = '2px dashed #ccc';
    ph.style.margin = getComputedStyle(draggedItem).margin;
    return ph;
  };

  const handleDragStart = (e) => {
    draggedItem = e.target.closest(options.items || '> *');
    if (!draggedItem) return;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedItem.innerHTML);

    draggedItem.classList.add('dragging');

    options.start?.(e, { item: draggedItem });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const target = e.target.closest(options.items || '> *');
    if (!target || target === draggedItem) return;

    const rect = target.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    if (e.clientY < midpoint) {
      target.parentNode.insertBefore(draggedItem, target);
    } else {
      target.parentNode.insertBefore(draggedItem, target.nextSibling);
    }

    options.change?.(e, { item: draggedItem });
  };

  const handleDragEnd = (e) => {
    draggedItem.classList.remove('dragging');

    const newOrder = Array.from(items()).map((item, index) => ({
      element: item,
      index: index,
    }));

    options.update?.(e, { item: draggedItem, newOrder });

    draggedItem = null;
  };

  const handleDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Make items draggable
  const initItems = () => {
    items().forEach((item) => {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', handleDragStart);
    });
  };

  // Set up event listeners
  element.addEventListener('dragover', handleDragOver);
  element.addEventListener('dragend', handleDragEnd);
  element.addEventListener('drop', handleDrop);

  initItems();

  // Return API
  return {
    destroy: () => {
      items().forEach((item) => {
        item.removeAttribute('draggable');
        item.removeEventListener('dragstart', handleDragStart);
      });
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('dragend', handleDragEnd);
      element.removeEventListener('drop', handleDrop);
    },
    refresh: () => {
      initItems();
    },
    disable: () => {
      items().forEach((item) => item.setAttribute('draggable', 'false'));
    },
    enable: () => {
      items().forEach((item) => item.setAttribute('draggable', 'true'));
    },
  };
}

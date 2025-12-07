import { createSignal, onCleanup, onMount } from 'solid-js';
import styles from './Splitter.module.scss';

/**
 * Resizable splitter component
 * Replaces jQuery draggable functionality
 */
export default function Splitter(props) {
  const [isDragging, setIsDragging] = createSignal(false);
  let startX = 0;
  let startWidth = 0;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startX = e.clientX;
    startWidth = props.width || 300;
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging()) return;

    const delta = e.clientX - startX;
    const newWidth = startWidth + delta;

    const min = props.min || 200;
    const max = props.max || 600;

    if (newWidth >= min && newWidth <= max) {
      props.onResize?.(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  return (
    <div class={styles.splitter} classList={{ [styles.dragging]: isDragging() }} onMouseDown={handleMouseDown}>
      <div class={styles.handle} />
    </div>
  );
}

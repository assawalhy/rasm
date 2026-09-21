import { Show, createSignal, onCleanup, onMount } from 'solid-js';
import styles from './Dropdown.module.scss';

/**
 * Dropdown component - replaces SUI ui-dropdown
 * No jQuery dependency
 */
export default function Dropdown(props) {
  const [isOpen, setIsOpen] = createSignal(false);
  let dropdownRef;

  const toggle = () => setIsOpen(!isOpen());

  const handleClickOutside = (e) => {
    if (dropdownRef && !dropdownRef.contains(e.target)) {
      setIsOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  return (
    <div ref={dropdownRef} class={`${styles.dropdown} ${props.class || ''}`} classList={{ [styles.open]: isOpen() }}>
      <button type="button" class={styles.dropdownToggle} onClick={toggle}>
        {props.label || 'Select'}
        <i class={`fas fa-chevron-${isOpen() ? 'up' : 'down'}`} />
      </button>

      <Show when={isOpen()}>
        <div class={styles.dropdownMenu}>{props.children}</div>
      </Show>
    </div>
  );
}

/**
 * Dropdown item component
 */
export function DropdownItem(props) {
  return (
    <button
      type="button"
      class={styles.dropdownItem}
      onClick={() => {
        props.onClick?.();
        props.onClose?.();
      }}
    >
      {props.children}
    </button>
  );
}

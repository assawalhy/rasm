import { Show, createSignal, onMount } from 'solid-js';
import { Portal } from 'solid-js/web';
import styles from './Message.module.scss';

/**
 * Message/Toast component - replaces SUI ui-messege
 * No jQuery dependency
 */

const [messages, setMessages] = createSignal([]);
let messageId = 0;

export function showMessage(text, type = 'info', duration = 3000) {
  const id = messageId++;
  const message = { id, text, type };

  setMessages([...messages(), message]);

  if (duration > 0) {
    setTimeout(() => {
      removeMessage(id);
    }, duration);
  }

  return id;
}

export function removeMessage(id) {
  setMessages(messages().filter((m) => m.id !== id));
}

export default function MessageContainer() {
  return (
    <Portal>
      <div class={styles.messageContainer}>
        <Show when={messages().length > 0}>
          {messages().map((message) => (
            <Message key={message.id} {...message} />
          ))}
        </Show>
      </div>
    </Portal>
  );
}

function Message(props) {
  const [isVisible, setIsVisible] = createSignal(false);

  onMount(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  });

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => removeMessage(props.id), 300);
  };

  return (
    <div
      class={styles.message}
      classList={{
        [styles.visible]: isVisible(),
        [styles[props.type]]: true,
      }}
    >
      <div class={styles.messageContent}>
        <i class={`fas fa-${getIcon(props.type)}`} />
        <span>{props.text}</span>
      </div>
      <button type="button" class={styles.closeButton} onClick={handleClose}>
        <i class="fas fa-times" />
      </button>
    </div>
  );
}

function getIcon(type) {
  switch (type) {
    case 'success':
      return 'check-circle';
    case 'error':
      return 'exclamation-circle';
    case 'warning':
      return 'exclamation-triangle';
    default:
      return 'info-circle';
  }
}

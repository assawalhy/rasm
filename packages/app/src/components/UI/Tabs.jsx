import { For, createSignal, children as resolveChildren } from 'solid-js';
import styles from './Tabs.module.scss';

/**
 * Tabs component - replaces SUI ui-tabs
 * No jQuery dependency
 */
export default function Tabs(props) {
  const [activeTab, setActiveTab] = createSignal(props.defaultTab || 0);

  const tabs = () => {
    const resolved = resolveChildren(() => props.children);
    return Array.isArray(resolved()) ? resolved() : [resolved()];
  };

  return (
    <div class={`${styles.tabs} ${props.class || ''}`}>
      <ul class={styles.tabList}>
        <For each={tabs()}>
          {(tab, index) => (
            <li
              classList={{ [styles.active]: activeTab() === index() }}
              onClick={() => {
                setActiveTab(index());
                props.onTabChange?.(index());
              }}
            >
              {tab.props?.label || `Tab ${index() + 1}`}
            </li>
          )}
        </For>
      </ul>

      <div class={styles.tabContent}>
        <For each={tabs()}>
          {(tab, index) => (
            <div class={styles.tabPane} classList={{ [styles.active]: activeTab() === index() }}>
              {tab}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

/**
 * Tab component - individual tab content
 */
export function Tab(props) {
  return props.children;
}

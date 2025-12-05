import CanvasContainer from '@components/Layout/Canvas/CanvasContainer';
import Keypad from '@components/Layout/Keypad/Keypad';
import Sidebar from '@components/Layout/Sidebar/Sidebar';
import MessageContainer from '@components/UI/Message';
import Splitter from '@components/UI/Splitter';
import { createSignal } from 'solid-js';
import styles from './App.module.scss';

/**
 * Main App component - root of the SolidJS application
 */
export default function App() {
  const [sidebarWidth, setSidebarWidth] = createSignal(300);

  return (
    <>
      <div class={styles.app}>
        <Sidebar width={sidebarWidth()} />
        <Splitter onResize={setSidebarWidth} min={200} max={600} />
        <CanvasContainer />
        <Keypad />
      </div>
      <MessageContainer />
    </>
  );
}

import App from '@components/App/App';
// SolidJS entry point
import { render } from 'solid-js/web';
import './style.css';

const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
} else {
  console.error('Root element not found');
}

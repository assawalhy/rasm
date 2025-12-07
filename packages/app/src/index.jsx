import App from '@components/App/App';
import './index.css';
// SolidJS entry point
import { render } from 'solid-js/web';
import 'solid-devtools';

const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
} else {
  console.error('Root element not found');
}

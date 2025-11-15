const device = window.navigator.userAgent.replace(/(android|iphone|ipad)/i, match => {
    return match.toLowerCase();
});
window.disableNativeKeypad = !!device;

import '../styles/style.scss';
import './rasm/index.js';

window.$('#loading-layer').fadeOut(1000);   
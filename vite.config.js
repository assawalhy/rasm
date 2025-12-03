import legacy from '@vitejs/plugin-legacy';
import pug from '@vituum/vite-plugin-pug';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    pug()
  ],
  build: {
    rollupOptions: {
      input: ['pugjs/index.pug']
    }
  }
});
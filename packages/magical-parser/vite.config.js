import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.js'),
        'customParsers/Math': resolve(__dirname, 'src/customParsers/Math.js'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
      output: {
        preserveModules: false,
      },
    },
  },
});

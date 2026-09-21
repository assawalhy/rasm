import legacy from '@vitejs/plugin-legacy';
import devtools from 'solid-devtools/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    devtools({
      autoname: true, // Auto-name signals for easier debugging
    }),
    solidPlugin(),
    legacy(['default', 'not IE 11']),
    tsconfigPaths(),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});


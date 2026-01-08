import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      include: ['src'],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RasmMath',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@scicave/math-latex-parser'],
      output: {
        preserveModules: false,
      },
    },
  },
});

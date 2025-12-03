import legacy from "@vitejs/plugin-legacy";
import pug from '@vituum/vite-plugin-pug';
import { defineConfig } from 'vite';
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    legacy(["default", "not IE 11"]),
    tsconfigPaths(),
    pug()
  ],
  build: {
    rollupOptions: {
      input: ['index.pug.html'],
    }
  }
});
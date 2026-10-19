import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import dts from 'unplugin-dts/vite';
import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ include: ["lib"] }),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    }
  }
})

import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import dts from 'unplugin-dts/vite';
import babel from '@rolldown/plugin-babel';
import { defineConfig, esmExternalRequirePlugin } from 'vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({ include: ["lib"] }),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    copyPublicDir: false,
    rolldownOptions: {
      // external: [/^react(-dom)?(\/.+)?$/],
      plugins: [
        esmExternalRequirePlugin({
          external: [/^react(-dom|\/jsx-runtime)?(\/.+)?$/],
        }),
      ],
    },
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    }
  }
})

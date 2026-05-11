import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'demo') {
    return {
      plugins: [react()],
      root: '.',
      build: {
        outDir: 'demo-dist',
      },
    };
  }

  return {
    plugins: [
      react(),
      dts({
        tsconfigPath: './tsconfig.build.json',
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
          assetFileNames: 'style.css',
        },
      },
      cssCodeSplit: false,
      copyPublicDir: false,
    },
  };
});

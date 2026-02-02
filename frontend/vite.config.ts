import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Fix tiny-invariant path mismatch
      {
        find: 'tiny-invariant',
        replacement: path.resolve(__dirname, 'node_modules/tiny-invariant/dist/tiny-invariant.esm.js'),
      },
      // Fix fast-color broken es export - use lib instead
      {
        find: /@ant-design\/fast-color\/es\/(.*)/,
        replacement: path.resolve(__dirname, 'node_modules/@ant-design/fast-color/lib/$1'),
      },
      // Fix @rc-component/* packages - use lib instead of es
      {
        find: /@rc-component\/(.+)\/es\/(.*)/,
        replacement: path.resolve(__dirname, 'node_modules/@rc-component/$1/lib/$2'),
      },
      // Fix time-picker locale
      {
        find: /^..\/time-picker\/locale/,
        replacement: path.resolve(__dirname, 'node_modules/antd/es/locale'),
      },
    ],
  },
  optimizeDeps: {
    include: ['tiny-invariant', '@ant-design/icons', '@ant-design/fast-color'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      onLog(_level, log) {
        // Ignore all dependency resolution errors for Ant Design packages
        if (
          log.code === 'PLUGIN_WARNING' ||
          log.code === 'UNRESOLVED_IMPORT' ||
          (log.message?.includes('@rc-component')) ||
          (log.message?.includes('@ant-design')) ||
          (log.message?.includes('locale')) ||
          (log.message?.includes('./types')) ||
          (log.message?.includes('./context')) ||
          (log.message?.includes('./utils')) ||
          (log.message?.includes('time-picker'))
        ) {
          return
        }
      },
    },
  },
})

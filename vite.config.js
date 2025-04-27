import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    commonjs({ include: /node_modules\/vuedraggable/ })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['vuedraggable']
  }
})

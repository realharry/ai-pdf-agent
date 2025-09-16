import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin to copy PDF.js worker file
    {
      name: 'copy-pdfjs-worker',
      generateBundle() {
        const workerSrc = resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
        const workerDest = resolve(__dirname, 'dist/pdf.worker.min.js')
        
        if (existsSync(workerSrc)) {
          copyFileSync(workerSrc, workerDest)
          console.log('Copied PDF.js worker to dist/pdf.worker.min.js')
        } else {
          console.warn('PDF.js worker not found at:', workerSrc)
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId?.includes('background.ts')) {
            return 'background.js'
          }
          if (facadeModuleId?.includes('content.ts')) {
            return 'content.js'
          }
          return 'sidepanel/[name].[hash].js'
        },
      },
    },
  },
  publicDir: 'public',
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  define: {
    'process.env': {},
    'process': {
      env: {}
    },
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://finautojobs-a-job-portal-hk5c.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://finautojobs-a-job-portal-hk5c.onrender.com',
        ws: true,
      },
    },
  },
  base: '/',
  optimizeDeps: {
    include: ['react', 'react-dom', 'wouter', '@tanstack/react-query', '@emotion/react', '@emotion/styled', '@mui/material'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          utils: ['axios', 'moment', 'lodash']
        }
      }
    }
  },
  esbuild: {
    loader: 'jsx',
    include: /\.jsx?$/,
    exclude: [],
    target: 'es2020',
  },
})

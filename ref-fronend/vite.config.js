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
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
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
    sourcemap: true,
  },
  esbuild: {
    loader: 'jsx',
    include: /\.jsx?$/,
    exclude: [],
    target: 'es2020',
  },
})
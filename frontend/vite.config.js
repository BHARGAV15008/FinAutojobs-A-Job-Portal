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
    host: '0.0.0.0', // Allow external connections
    strictPort: false, // Allow port fallback if 3000 is busy
    hmr: {
      port: 3001
    },
    fs: {
      strict: false
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // Log proxy requests for debugging
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxying request:', req.method, req.url, '→', options.target + req.url);
          });
        }
      },
      '/socket.io': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
    strictPort: false,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.onrender.com',
      'finautojobs-frontend.onrender.com',
      '.vercel.app',
      '.herokuapp.com'
    ]
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

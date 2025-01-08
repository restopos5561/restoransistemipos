import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: false
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'utils-vendor': ['date-fns', 'axios', 'zustand']
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      sourcemap: true,
      target: 'esnext'
    },
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers',
      'react-hook-form',
      '@hookform/resolvers',
      'date-fns',
      'axios',
      'zustand'
    ]
  },
  css: {
    devSourcemap: true
  }
}); 
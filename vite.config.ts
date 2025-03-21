import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@mui/material/utils',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled'
    ],
    exclude: ['lucide-react']
  },
  resolve: {
    alias: {
      '@mui/icons-material': '@mui/icons-material/esm',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://fa29a0b7-ceb0-4265-b5e7-329be013efb3-00-29mtjv18wa4j8.sisko.replit.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    },
  },
});
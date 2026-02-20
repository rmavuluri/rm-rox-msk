import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: '/', // Set base path for deployment
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    server: {
      port: 5174,
      host: true,
      open: true, // Automatically open browser on server start
      cors: true, // Enable CORS
      proxy: {
        // Proxy API requests to your backend
        // Note: This proxy is optional if using direct API calls via VITE_BACKEND_URL
        '/api': {
          target: 'http://localhost:8000', // Python backend runs on port 8000
          changeOrigin: true,
          secure: false
        }
      },
      // Additional server options
      hmr: {
        overlay: true // Show error overlay in browser
      }
    },
    build: {
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Simplified chunk splitting
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom']
          }
        }
      },
      // Enable source maps for debugging (optional)
      sourcemap: false,
      // Minify options
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      }
    }
  }
})
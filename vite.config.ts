import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Create base configuration
  const config = {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://146.235.215.215:30003',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }

  // Add HTTPS configuration when using dev-https command
  if (mode === 'https') {
    console.log('Starting dev server with HTTPS using mkcert')
    
    // Add mkcert plugin for HTTPS
    config.plugins.push(mkcert())
    
    // Enable HTTPS
    config.server.https = true
  }

  return config
})
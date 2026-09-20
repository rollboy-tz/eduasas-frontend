import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Pakia env variables kulingana na mode (development, production, beta)
  const env = loadEnv(mode, process.cwd(), '')
  const rawApiUrl = env.VITE_API_URL || 'https://api.eduasas.co.tz'
  const targetApiUrl = /^https?:\/\//i.test(rawApiUrl) ? rawApiUrl : `https://${rawApiUrl}`

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src'),
      },
    },

    // Mipangilio ya Seva ya local (Development Server & Proxy)
    server: {
      port: 3000,
      host: '0.0.0.0', // Inaruhusu kupatikana kupitia local IP kwenye network yako (mfano: 192.168.x.x)
      allowedHosts: true,
      proxy: {
        // Kila ombi linaloanza na '/api' litapelekwa kwenye API server wakati wa local dev
        '/api': {
          target: targetApiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/main'),
        },
      },
    },

    // Mipangilio ya Production Build (Optimized kwa ajili ya Cloudflare Pages)
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      target: 'esnext',
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('framer-motion') || id.includes('lucide-react')) {
                return 'vendor-ui';
              }
              return 'vendor-core'; 
            }
          },
        },
      },
    },
  }
})
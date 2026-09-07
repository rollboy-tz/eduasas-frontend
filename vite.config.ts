
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
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
    server: {
      port: 3000,
      host: true,
      proxy: {
        // Kila ombi linaloanza na '/api' litapelekwa kwenye api.eduasas.co.tz
        '/api': {
          target: env.VITE_API_URL || 'https://api.eduasas.co.tz',
          changeOrigin: true,
          secure: false,
          // Hapa tunaruhusu kubadilisha au kuweka 'main' kama ndio mzizi wako
          rewrite: (p) => p.replace(/^\/api/, '/main'),
        },
      },
    },
  }
})
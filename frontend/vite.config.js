import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  // ✅ Dev server
  server: {
    port: 5173,
  },

  // ✅ Preview server
  preview: {
    port: 4173,
  },

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      devOptions: {
        enabled: false 
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            // ✅ /api use kiya — localhost hataya
            urlPattern: /\/api\/offline/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'offline-api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 din
              },
            },
          },
          {
            // ✅ Gemini — sirf net se
            urlPattern: /\/api\/ai/,
            handler: 'NetworkOnly',
          },
          {
            // ✅ Deepfake — sirf net se
            urlPattern: /\/api\/deepfake/,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'EduAI - Smart Learning Assistant',
        short_name: 'EduAI',
        description: 'AI Education Assistant for Class 5-12 Students',
        theme_color: '#1a1a24',
        background_color: '#1a1a24',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
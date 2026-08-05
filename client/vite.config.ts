import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 1. Defina a versão semântica manual da sua aplicação (X.Y.Z)
const APP_SEMVER = '1.0.0'

// 2. Captura os 7 primeiros caracteres do commit SHA do Vercel
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA
  ? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)
  : 'dev'

// 3. Monta no padrão SemVer com metadados de build: 1.0.0+a1b2c3d
const appVersion = `v${APP_SEMVER}+${commitSha}`

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'PersonaLite',
        short_name: 'PersonaLite',
        description: 'Acompanhamento de evolução física e treinos',
        theme_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:5000\/api\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-cache' }
          }
        ]
      }
    })
  ],
})
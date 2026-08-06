import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['saka-padded.png'],
      manifest: {
        name: 'SAKA Platform',
        short_name: 'SAKA',
        description: 'Platform Belajar Bahasa Inggris',
        theme_color: '#10b981', // emerald-500
        background_color: '#ffffff', // pure white background to match padded icon
        display: 'standalone',
        icons: [
          {
            src: '/saka-padded.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/saka-padded.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-ui': ['react-hot-toast'],
          
          // Feature chunks
          'feature-gamification': [
            './src/components/gamification/BadgeDisplay.jsx',
            './src/components/gamification/StreakTracker.jsx',
            './src/components/gamification/DailyRewardCard.jsx',
          ],
          'feature-realtime': [
            './src/components/realtime/LiveLeaderboard.jsx',
            './src/components/realtime/RealtimeNotificationIndicator.jsx',
            './src/services/socketService.js',
          ],
          'feature-discussion': [
            './src/components/discussion/CommentSection.jsx',
            './src/components/discussion/CommentForm.jsx',
            './src/components/discussion/CommentCard.jsx',
          ],
          'feature-admin': [
            './src/admin/components/AdminLayout.jsx',
            './src/admin/components/Sidebar.jsx',
            './src/admin/components/UsersTable.jsx',
            './src/admin/components/KPICard.jsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
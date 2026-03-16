import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
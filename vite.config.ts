import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/chord-genesis/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        // Split the ElevenLabs SDK into separate chunk
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@11labs') || id.includes('@elevenlabs') || id.includes('elevenlabs')) {
              return 'elevenlabs';
            }
            if (id.includes('react-dom')) {
              return 'react-vendor';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});

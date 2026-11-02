import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/research/**', '**/docs/**', '**/tests/**']
    }
  },
  preview: {
    port: 4173,
    host: true
  },
  optimizeDeps: {
    entries: ['index.html', 'src/**/*.{ts,tsx}']
  }
});

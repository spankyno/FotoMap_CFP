import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  define: {
    // shp-write usa process.env.NODE_ENV internamente, que no existe en el navegador
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
          vendor: ['zustand', 'motion', 'sonner'],
        },
      },
    },
  },
});

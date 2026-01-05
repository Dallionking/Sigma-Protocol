import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      customViteReactPlugin: true,
    }),
    react(),
  ],
});

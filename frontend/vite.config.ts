import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// TanStackRouterVite auto-generates src/routeTree.gen.ts from src/routes/**
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  server: {
    host: '127.0.0.1',
    port: 8009,
  },
  appType: 'spa',                    // HTML5 History API fallback for SPA routes
});

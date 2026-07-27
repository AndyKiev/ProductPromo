import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// In the container the source arrives over a Windows bind mount, which
// delivers no inotify events — the watcher has to poll or HMR never fires.
// (CHOKIDAR_USEPOLLING is a webpack-dev-server convention; Vite ignores it.)
const inDocker = process.env.VITE_IN_DOCKER === 'true';

// TanStackRouterVite auto-generates src/routeTree.gen.ts from src/routes/**
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  server: {
    host: '127.0.0.1',               // compose overrides with --host 0.0.0.0
    port: 8009,
    ...(inDocker && {
      watch: { usePolling: true, interval: 300 },
      // The browser reaches the container on the published port (8013), not
      // the 8009 the server listens on, so the HMR socket must be told.
      hmr: { clientPort: 8013 },
    }),
  },
  appType: 'spa',                    // HTML5 History API fallback for SPA routes
});

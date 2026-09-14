import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// The source lives on the WSL2 filesystem, so inotify events reach the
// container and Vite's default watcher works — no usePolling needed.
const inDocker = process.env.VITE_IN_DOCKER === 'true';

// TanStackRouterVite auto-generates src/routeTree.gen.ts from src/routes/**
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  server: {
    host: '127.0.0.1',               // compose overrides with --host 0.0.0.0
    port: 8009,
    ...(inDocker && {
      // The browser reaches the container on the published port (8013), not
      // the 8009 the server listens on, so the HMR socket must be told.
      hmr: { clientPort: 8013 },
    }),
  },
  appType: 'spa',                    // HTML5 History API fallback for SPA routes
});

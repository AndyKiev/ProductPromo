import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// The catalog app's own frontend. Shared UI comes from the @catalog/ui kit (source-only:
// compiled here, hence the alias and the optimizeDeps exclusion).
const inDocker = process.env.VITE_IN_DOCKER === 'true';
const ui = path.resolve(import.meta.dirname, './node_modules/@catalog/ui/src');

// tanstackRouter auto-generates src/routeTree.gen.ts from src/routes/**
export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  resolve: {
    alias: { '@ui': ui, '@': path.resolve(import.meta.dirname, './src') },
    dedupe: ['react', 'react-dom', '@tanstack/react-query', '@tanstack/react-router', 'zustand'],
  },
  optimizeDeps: {
    // The kit is source: Vite compiles it like app code. Its dependencies must be named here,
    // because Vite does not scan an excluded package for them (CommonJS ones then fail in the
    // browser: "does not provide an export named 'default'").
    exclude: ["@catalog/ui", "@ui"],   // "@ui" too: aliased imports must not be pre-bundled as a second copy
    include: [
      'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime',
      '@emotion/react', '@emotion/styled', '@mui/material', '@mui/x-data-grid',
      '@mui/x-date-pickers/DatePicker', '@mui/x-date-pickers/LocalizationProvider',
      '@mui/x-date-pickers/AdapterDayjs', 'dayjs', 'dayjs/locale/ru',
      '@tanstack/react-query', '@tanstack/react-router', 'axios', 'zustand', 'zustand/middleware',
      'react-hook-form', '@hookform/resolvers/zod', 'zod', 'radix-ui', 'cmdk', 'sonner', 'lucide-react',
      'class-variance-authority', 'clsx', 'tailwind-merge',
    ],
  },
  server: {
    host: '127.0.0.1',               // compose overrides with --host 0.0.0.0
    port: 8009,
    // The browser reaches the container on the published port (8013), so the HMR socket must be told.
    ...(inDocker && { hmr: { clientPort: 8013 } }),
  },
  appType: 'spa',                    // HTML5 History API fallback for SPA routes
});

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme/ThemeContext';
import { routeTree } from './routeTree.gen';
import './styles.css';
import LanguageProvider from './i18n/LanguageProvider';
import { z } from 'zod';

// Explicit schema messages still win; all other validation errors use a catalog key.
z.config({ customError: () => 'invalidValue' });

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider><RouterProvider router={router} /></LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);

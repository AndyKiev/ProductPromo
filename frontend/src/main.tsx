import './app';   // first: names the app before anything renders
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { mountApp } from '@ui/app/mount';
import { routeTree } from './routeTree.gen';
import './index.css';

const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

mountApp(<RouterProvider router={router} />);

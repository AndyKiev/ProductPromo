import { createRootRoute } from '@tanstack/react-router';
import { authGuard } from '@ui/app/guard';
import RootLayout from '@ui/components/layout/Rootlayout';

// Everything except the login page needs this app's own session.
export const Route = createRootRoute({
  beforeLoad: ({ location }) => authGuard(location.pathname),
  component: RootLayout,
});

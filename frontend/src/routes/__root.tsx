import { createRootRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import RootLayout from '../components/layout/Rootlayout';

const PUBLIC_PATHS = ['/auth/login'];
const isPublic = (p: string) => PUBLIC_PATHS.some((x) => p.startsWith(x));

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const { access_token } = useAuthStore.getState();
    const path = location.pathname;
    if (!access_token && !isPublic(path)) {
      throw redirect({ to: '/auth/login' });
    }
    if (access_token && isPublic(path)) {
      throw redirect({ to: '/admin/nomenclature' });
    }
  },
  component: RootLayout,
});

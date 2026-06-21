import { Outlet } from '@tanstack/react-router';

// Providers (Query, Theme) live in main.tsx; this is the routed root shell.
export default function RootLayout() {
  return <Outlet />;
}

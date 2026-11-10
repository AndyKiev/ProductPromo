import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@ui/components/auth/LoginPage';

// This app's own login page (title from src/app.ts).
export const Route = createFileRoute('/auth/login')({ component: LoginPage });

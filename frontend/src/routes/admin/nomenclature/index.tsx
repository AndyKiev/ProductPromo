import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/nomenclature/')({
    beforeLoad: () => { throw redirect({ to: '/admin/nomenclature/markets' }); },
});

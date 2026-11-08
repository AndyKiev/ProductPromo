import { createFileRoute, redirect } from '@tanstack/react-router';
import { promoDirectories } from '../../../components/admin/promo/promoDirectories';

export const Route = createFileRoute('/admin/promo/')({
    beforeLoad: () => {
        throw redirect({ to: '/admin/promo/$directory', params: { directory: promoDirectories[0].key } });
    },
});

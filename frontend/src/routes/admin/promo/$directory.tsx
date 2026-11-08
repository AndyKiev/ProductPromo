// One route for every promo directory: the URL segment picks the config entry.
import { createFileRoute, notFound } from '@tanstack/react-router';
import { DirectoryCrud } from '../../../components/admin/directory/DirectoryCrud';
import { promoDirectories } from '../../../components/admin/promo/promoDirectories';

export const Route = createFileRoute('/admin/promo/$directory')({
    loader: ({ params }) => {
        const def = promoDirectories.find((d) => d.key === params.directory);
        if (!def) throw notFound();
        return def;
    },
    component: function PromoDirectory() {
        return <DirectoryCrud def={Route.useLoaderData()} />;
    },
});

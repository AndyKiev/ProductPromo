// /admin/promo — AppShell section with one tab per entry in promoDirectories.
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import AdminSectionLayout from '../../../components/layout/AdminSectionLayout';
import useString from '../../../hooks/useString';
import cfl from '../../../utils/capitalizeFirstLetter';
import catalogStrings from '../../../components/admin/catalogStrings';
import { promoDirectories } from '../../../components/admin/promo/promoDirectories';

const BASE = '/admin/promo';

function PromoLayout() {
    const getString = useString({ str: catalogStrings });
    const navigate = useNavigate();
    const path = useRouterState({ select: (s) => s.location.pathname });
    const idx = promoDirectories.findIndex((d) => path.startsWith(`${BASE}/${d.key}`));

    return (
        <AdminSectionLayout title={cfl(getString('promo'))}
            tabs={promoDirectories.map((d) => ({ key: d.key, label: cfl(getString(d.titleKey)) }))}
            value={idx === -1 ? 0 : idx}
            onTabChange={(v) => navigate({ to: '/admin/promo/$directory', params: { directory: promoDirectories[v].key } })}>
            <Outlet />
        </AdminSectionLayout>
    );
}

export const Route = createFileRoute('/admin/promo')({
    component: PromoLayout,
});

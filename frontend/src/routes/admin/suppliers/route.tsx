// Nested layout route for /admin/suppliers — AppShell + sub-nav; children render into <Outlet/>.
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import AdminSectionLayout from '../../../components/layout/AdminSectionLayout';
import useString from '../../../hooks/useString';
import cfl from '../../../utils/capitalizeFirstLetter';
import catalogStrings from '../../../components/admin/catalogStrings';

const BASE = '/admin/suppliers';
const TABS = [
    { key: 'list', label: 'suppliers' },
    { key: 'supplier-statuses', label: 'supplierStatuses' },
    { key: 'supplier-product-statuses', label: 'supplierProductStatuses' },
    { key: 'associations', label: 'associations' },
] as const;

function SuppliersLayout() {
    const getString = useString({ str: catalogStrings });
    const navigate = useNavigate();
    const path = useRouterState({ select: (s) => s.location.pathname });
    const idx = TABS.findIndex((t) => path.startsWith(`${BASE}/${t.key}`));
    const value = idx === -1 ? 0 : idx;

    return (
        <AdminSectionLayout title={cfl(getString('suppliers'))}
            tabs={TABS.map((tab) => ({ ...tab, label: cfl(getString(tab.label)) }))}
            value={value} onTabChange={(v) => navigate({ to: `${BASE}/${TABS[v].key}` as '/' })}>
            <Outlet />
        </AdminSectionLayout>
    );
}

export const Route = createFileRoute('/admin/suppliers')({
    component: SuppliersLayout,
});

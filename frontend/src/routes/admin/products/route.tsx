// Nested layout route for /admin/products — AppShell + sub-nav; children render into <Outlet/>.
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import AdminSectionLayout from '../../../components/layout/AdminSectionLayout';
import useString from '../../../hooks/useString';
import cfl from '../../../utils/capitalizeFirstLetter';
import catalogStrings from '../../../components/admin/catalogStrings';

const BASE = '/admin/products';
const TABS = [
    { key: 'list', label: 'products' },
    { key: 'product-statuses', label: 'productStatuses' },
    { key: 'product-types', label: 'productTypes' },
    { key: 'import-codes', label: 'importCodes' },
    { key: 'tax-types', label: 'taxTypes' },
    { key: 'tax-rates', label: 'taxRates' },
    { key: 'product-taxes', label: 'productTaxes' },
] as const;

function ProductsLayout() {
    const getString = useString({ str: catalogStrings });
    const navigate = useNavigate();
    const path = useRouterState({ select: (s) => s.location.pathname });
    const idx = TABS.findIndex((t) => path.startsWith(`${BASE}/${t.key}`));
    const value = idx === -1 ? 0 : idx;

    return (
        <AdminSectionLayout title={cfl(getString('products'))}
            tabs={TABS.map((tab) => ({ ...tab, label: cfl(getString(tab.label)) }))}
            value={value} onTabChange={(v) => navigate({ to: `${BASE}/${TABS[v].key}` as '/' })}>
            <Outlet />
        </AdminSectionLayout>
    );
}

export const Route = createFileRoute('/admin/products')({
    component: ProductsLayout,
});

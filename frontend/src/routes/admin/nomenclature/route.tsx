// Nested layout route for /admin/nomenclature — renders AppShell + sub-nav,
// children render into <Outlet/>. (TanStack Router file-based nested routing.)
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import AdminSectionLayout from '../../../components/layout/AdminSectionLayout';
import useString from '../../../hooks/useString';
import cfl from '../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../../../components/admin/nomenclature/_shared/nomenclatureStrings';

const BASE = '/admin/nomenclature';
const TABS = [
    { key: 'markets', label: 'markets' },
    { key: 'segments', label: 'segments' },
    { key: 'categories', label: 'categories' },
    { key: 'families', label: 'families' },
    { key: 'keys', label: 'keys' },
    { key: 'links', label: 'links' },
    { key: 'key-links', label: 'keyLinks' },
] as const;

function NomenclatureLayout() {
    const getString = useString({ str: nomenclatureStrings });
    const navigate = useNavigate();
    const path = useRouterState({ select: (s) => s.location.pathname });
    const idx = TABS.findIndex((t) => path.startsWith(`${BASE}/${t.key}`));
    const value = idx === -1 ? 0 : idx;

    return (
        <AdminSectionLayout title={cfl(getString('nomenclature'))}
            tabs={TABS.map((tab) => ({ ...tab, label: cfl(getString(tab.label)) }))}
            value={value} onTabChange={(v) => navigate({ to: `${BASE}/${TABS[v].key}` as '/' })}>
            <Outlet />
        </AdminSectionLayout>
    );
}

export const Route = createFileRoute('/admin/nomenclature')({
    component: NomenclatureLayout,
});

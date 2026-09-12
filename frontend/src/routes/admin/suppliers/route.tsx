// Nested layout route for /admin/suppliers — AppShell + sub-nav; children render into <Outlet/>.
import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from '@tanstack/react-router';
import { Box, Breadcrumbs, Tab, Tabs, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AppShell from '../../../components/layout/AppShell';
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
        <AppShell>
            <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1500, mx: 'auto' }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                    <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="body2" color="text.secondary">{cfl(getString('admin'))}</Typography>
                    </Link>
                    <Typography variant="body2" color="text.primary" fontWeight={600}>{cfl(getString('suppliers'))}</Typography>
                </Breadcrumbs>

                <Tabs value={value} onChange={(_, v) => navigate({ to: `${BASE}/${TABS[v].key}` as '/' })}
                    sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    {TABS.map((t) => <Tab key={t.key} label={cfl(getString(t.label))} />)}
                </Tabs>

                <Outlet />
            </Box>
        </AppShell>
    );
}

export const Route = createFileRoute('/admin/suppliers')({
    component: SuppliersLayout,
});

// Nested layout route for /admin/nomenclature — renders AppShell + sub-nav,
// children render into <Outlet/>. (TanStack Router file-based nested routing.)
import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from '@tanstack/react-router';
import { Box, Breadcrumbs, Tab, Tabs, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AppShell from '../../../components/layout/AppShell';
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
        <AppShell>
            <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, mx: 'auto' }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                    <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="body2" color="text.secondary">{cfl(getString('admin'))}</Typography>
                    </Link>
                    <Typography variant="body2" color="text.primary" fontWeight={600}>{cfl(getString('nomenclature'))}</Typography>
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

export const Route = createFileRoute('/admin/nomenclature')({
    component: NomenclatureLayout,
});

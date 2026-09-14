import type { ReactNode } from 'react';
import { Box, Breadcrumbs, Tab, Tabs, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from '@tanstack/react-router';
import AppShell from './AppShell';
import useString from '../../hooks/useString';
import cfl from '../../utils/capitalizeFirstLetter';

type AdminSectionLayoutProps = {
  title: string;
  tabs: readonly { key: string; label: string }[];
  value: number;
  onTabChange: (value: number) => void;
  children: ReactNode;
};

/** Keeps the section navigation fixed while a page's data grid owns vertical scrolling. */
export default function AdminSectionLayout({ title, tabs, value, onTabChange, children }: AdminSectionLayoutProps) {
  const getString = useString();
  return (
    <AppShell>
      <Box className="admin-section-layout">
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2, flexShrink: 0 }}>
          <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" color="text.secondary">{cfl(getString('admin'))}</Typography>
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={600}>{title}</Typography>
        </Breadcrumbs>
        <Tabs value={value} onChange={(_, nextValue) => onTabChange(nextValue)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          {tabs.map((tab) => <Tab key={tab.key} label={tab.label} />)}
        </Tabs>
        <Box className="admin-section-content">{children}</Box>
      </Box>
    </AppShell>
  );
}

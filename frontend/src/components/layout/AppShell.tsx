import { type FC, type ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AppBar, Box, Toolbar, Typography, Button, Stack } from '@mui/material';
import { CategoryRounded, Inventory2Rounded, LocalShippingRounded } from '@mui/icons-material';
import { useTheme } from '../theme/useTheme';
import Logo from './Logo';
import cfl from '../../utils/capitalizeFirstLetter';
import useString from '../../hooks/useString';
import AccountMenu from '../account/AccountMenu';

const AppShell: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTheme();
  const getString = useString();
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  const navBtn = (label: string, path: string, icon: ReactNode) => {
    const active = currentPath.startsWith(path);
    return (
      <Button key={path} startIcon={icon} onClick={() => navigate({ to: path as '/' })}
        sx={{
          borderRadius: '9px', px: 1.75, py: 0.75, fontSize: 13,
          fontWeight: active ? 700 : 500, color: active ? t.accent : t.textMuted,
          background: active ? `${t.accent}14` : 'transparent', textTransform: 'none',
          '&:hover': { background: `${t.accent}10`, color: t.accent },
        }}>
        {cfl(getString(label))}
      </Button>
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: t.bg }}>
      <AppBar position="static" elevation={0}
        sx={{ background: `${t.cardBg}f0`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${t.borderLight}`, color: t.text }}>
        <Toolbar sx={{ gap: 1, minHeight: '56px !important', px: { xs: 2, sm: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1} mr={3}>
            <Logo size={28} />
            <Typography fontWeight={700} fontSize={15} color={t.text} sx={{ userSelect: 'none' }}>
              ProductPromo
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} flexGrow={1}>
            {navBtn('nomenclature', '/admin/nomenclature', <CategoryRounded sx={{ fontSize: 16 }} />)}
            {navBtn('products', '/admin/products', <Inventory2Rounded sx={{ fontSize: 16 }} />)}
            {navBtn('suppliers', '/admin/suppliers', <LocalShippingRounded sx={{ fontSize: 16 }} />)}
          </Stack>

          <AccountMenu />
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{children}</Box>
    </Box>
  );
};

export default AppShell;

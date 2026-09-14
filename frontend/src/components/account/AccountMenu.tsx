import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Menu, MenuItem, Box, Typography, Divider, ListItemIcon, ListItemText } from '@mui/material';
import { AccountCircleOutlined, LogoutRounded } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import useString from '../../hooks/useString';
import cfl from '../../utils/capitalizeFirstLetter';
import ThemeSwitch from '../theme/ThemeSwitch';
import LanguageSelect from './LanguageSelect';

export default function AccountMenu() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getString = useString();

  const handleLogout = async () => {
    setAnchor(null);
    logout();
    qc.removeQueries({ queryKey: ['profile'] });
    await navigate({ to: '/auth/login' });
  };

  return <>
    <Button startIcon={<AccountCircleOutlined />} onClick={(e) => setAnchor(e.currentTarget)}
      aria-label={cfl(getString('account'))} aria-haspopup="menu" aria-expanded={Boolean(anchor)}>
      {user?.name ?? cfl(getString('account'))}
    </Button>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
      <Box sx={{ px: 2, py: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography fontWeight={600}>{cfl(getString('account'))}</Typography>
        <LanguageSelect />
        <ThemeSwitch />
      </Box>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>
        <ListItemText>{cfl(getString('signOut'))}</ListItemText>
      </MenuItem>
    </Menu>
  </>;
}

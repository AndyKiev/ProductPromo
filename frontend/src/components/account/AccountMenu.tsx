import { useState } from 'react';
import { Button, Menu, Box, Typography } from '@mui/material';
import { AccountCircleOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import useString from '../../hooks/useString';
import cfl from '../../utils/capitalizeFirstLetter';
import LanguageSelect from './LanguageSelect';

export default function AccountMenu() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const user = useAuthStore((s) => s.user);
  const getString = useString();
  return <>
    <Button startIcon={<AccountCircleOutlined />} onClick={(e) => setAnchor(e.currentTarget)}
      aria-label={cfl(getString('account'))} aria-haspopup="menu" aria-expanded={Boolean(anchor)}>
      {user?.name ?? cfl(getString('account'))}
    </Button>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
      <Box sx={{ px: 2, py: 1, minWidth: 240 }}>
        <Typography fontWeight={600} mb={2}>{cfl(getString('account'))}</Typography>
        <LanguageSelect />
      </Box>
    </Menu>
  </>;
}

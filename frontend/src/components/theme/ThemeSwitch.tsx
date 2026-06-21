import { IconButton, Tooltip } from '@mui/material';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import { useTheme } from './ThemeContext';

export default function ThemeSwitch() {
  const { mode, toggle, t } = useTheme();
  return (
    <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
      <IconButton size="small" onClick={toggle} sx={{ color: t.textMuted }}>
        {mode === 'light' ? <DarkModeRounded fontSize="small" /> : <LightModeRounded fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}

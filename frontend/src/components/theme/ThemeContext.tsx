import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

type Mode = 'light' | 'dark';

interface Palette {
  bg: string; cardBg: string; text: string; textMuted: string;
  border: string; borderLight: string; inputBg: string; disabledBg: string;
  accent: string;
}

const PALETTES: Record<Mode, Palette> = {
  light: {
    bg: '#f6f7f9', cardBg: '#ffffff', text: '#1a1f2b', textMuted: '#5b6472',
    border: '#d7dce3', borderLight: '#e7ebf0', inputBg: '#ffffff', disabledBg: '#f0f2f5',
    accent: '#3a5bd0',
  },
  dark: {
    bg: '#0f1218', cardBg: '#171b22', text: '#e7ebf0', textMuted: '#9aa4b2',
    border: '#2a313c', borderLight: '#222831', inputBg: '#1b212a', disabledBg: '#161b22',
    accent: '#5b7cff',
  },
};

interface ThemeCtx { t: Palette; mode: Mode; toggle: () => void; }
const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');
  const t = PALETTES[mode];

  const muiTheme = useMemo(
    () => createTheme({ palette: { mode, primary: { main: t.accent }, background: { default: t.bg, paper: t.cardBg } } }),
    [mode, t.accent, t.bg, t.cardBg],
  );

  const value = useMemo<ThemeCtx>(() => ({ t, mode, toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }), [t, mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

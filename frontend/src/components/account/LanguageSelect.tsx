import { useState } from 'react';
import { Alert, MenuItem, Stack, TextField } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { fetchMessages, saveLanguage } from '../../api/languageApi';
import { useTranslationsStore } from '../../store/useTranslationsStore';
import { useAuthStore } from '../../store/authStore';
import useString from '../../hooks/useString';
import cfl from '../../utils/capitalizeFirstLetter';

export default function LanguageSelect() {
  const { languages, selected, select, load } = useTranslationsStore();
  const { access_token, setUser } = useAuthStore();
  const getString = useString();
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const change = async (id: number) => {
    const language = languages.find((l) => l.id === id);
    if (!language || selected?.id === id) return;
    setPending(true); setError(null);
    try {
      const bundle = await fetchMessages(id);
      const profile = access_token ? await saveLanguage(id) : null;
      await qc.cancelQueries({ predicate: (q) => q.queryKey[0] !== 'languages' });
      load(bundle); select(language);
      if (profile) { setUser(profile); qc.setQueryData(['profile'], profile); }
      await qc.invalidateQueries({ predicate: (q) => !['languages', 'profile', 'messages'].includes(String(q.queryKey[0])) });
    } catch (e) { setError(e instanceof Error ? e.message : getString('requestFailed')); }
    finally { setPending(false); }
  };
  return <Stack spacing={1}>
    <TextField select size="small" label={cfl(getString('language'))}
      value={languages.some((l) => l.id === selected?.id) ? selected!.id : ''}
      disabled={pending || languages.length === 0} onChange={(e) => void change(Number(e.target.value))}
      sx={{ minWidth: 160 }}>
      {languages.map((l) => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
    </TextField>
    {error && <Alert severity="error">{error}</Alert>}
  </Stack>;
}

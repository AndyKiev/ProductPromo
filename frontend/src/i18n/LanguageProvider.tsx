import { useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { fetchLanguages, fetchMessages, fetchProfile } from '../api/languageApi';
import { useAuthStore } from '../store/authStore';
import { useTranslationsStore } from '../store/useTranslationsStore';
import useString from '../hooks/useString';

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const { access_token, user, setUser } = useAuthStore();
  const { selected, select, setLanguages, load } = useTranslationsStore();
  const getString = useString();
  const languages = useQuery({ queryKey: ['languages'], queryFn: fetchLanguages, staleTime: 60_000 });
  const profile = useQuery({ queryKey: ['profile'], queryFn: fetchProfile, enabled: !!access_token,
    staleTime: 0, refetchOnWindowFocus: true });
  useEffect(() => {
    if (!languages.data) return;
    setLanguages(languages.data);
    if (!selected || !languages.data.some((l) => l.id === selected.id)) {
      const browserCode = navigator.language.toLowerCase().startsWith('ru') ? 'rus' : 'eng';
      const initial = languages.data.find((l) => l.short_name === browserCode);
      if (initial) select(initial);
    }
  }, [languages.data, selected, select, setLanguages]);
  useEffect(() => {
    if (access_token && profile.data) { setUser(profile.data); select(profile.data.lang); }
  }, [access_token, profile.data, select, setUser]);
  const messages = useQuery({ queryKey: ['messages', selected?.id],
    queryFn: () => fetchMessages(selected!.id), enabled: !!selected,
    staleTime: 30_000, refetchInterval: 30_000, refetchOnWindowFocus: true });
  useEffect(() => { if (messages.data) load(messages.data); }, [messages.data, load]);
  useEffect(() => { document.documentElement.lang = selected?.locale ?? 'en'; }, [selected]);
  if (access_token && !user) {
    return <Box sx={{ p: 4 }}>{profile.isError
      ? <Alert severity="error" action={<Button onClick={() => void profile.refetch()}>{getString('retry')}</Button>}>{getString('profileLoadFailed')}</Alert>
      : <CircularProgress aria-label={getString('loading')} />}</Box>;
  }
  return <>{children}</>;
}

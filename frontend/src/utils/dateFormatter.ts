import { useTranslationsStore } from '../store/useTranslationsStore';

// Historical export name retained for existing column renderers.
export function formatToUkrDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat(useTranslationsStore.getState().selected?.locale ?? 'en', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(d);
}

import { useCallback } from 'react';
import { useTranslationsStore, type StringResource } from '../store/useTranslationsStore';
import fallbackStrings from '../i18n/ui.json';

export type { StringResource } from '../store/useTranslationsStore';
interface UseStringParams { exrStr?: StringResource; str?: StringResource }
const defaults: StringResource = fallbackStrings;

export function translate(stringKey: string, variables: Record<string, unknown> = {}, resources?: StringResource): string {
  if (!stringKey) return '';
  const { selected, languages, bundles } = useTranslationsStore.getState();
  const code = selected?.short_name ?? 'eng';
  const english = languages.find((l) => l.short_name === 'eng');
  const text = (selected && bundles[selected.id]?.messages[stringKey])
    || resources?.[stringKey]?.[code] || defaults[stringKey]?.[code]
    || (english && bundles[english.id]?.messages[stringKey])
    || resources?.[stringKey]?.eng || defaults[stringKey]?.eng || stringKey;
  return text.replace(/\$\{(\w+)\}/g, (match, name) => variables[name] == null ? match : String(variables[name]));
}
export function useString({ exrStr, str }: UseStringParams = {}) {
  const selected = useTranslationsStore((s) => s.selected);
  const bundles = useTranslationsStore((s) => s.bundles);
  return useCallback((key: string, variables?: Record<string, unknown>) =>
    translate(key, variables, exrStr ?? str), [selected, bundles, exrStr, str]);
}
export default useString;

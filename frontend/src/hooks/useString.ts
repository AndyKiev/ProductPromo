import { useMemo } from 'react';
import { defaultLangShortName } from '../utils/eNums';
import { useTranslationsStore } from '../store/useTranslationsStore';
import { useAuthStore } from '../store/authStore';

export interface StringResource {
  [key: string]: { [language: string]: string };
}

interface UseStringParams {
  exrStr?: StringResource;
  str?: StringResource;
}

type UseStringReturn = (stringKey: string, variables?: Record<string, unknown>) => string;

export const useString = ({ exrStr, str }: UseStringParams = {}): UseStringReturn => {
  const user = useAuthStore((s) => s.user);
  const userLang = user?.lang?.short_name || defaultLangShortName;
  const { strings } = useTranslationsStore();

  return useMemo(() => {
    return (stringKey: string, variables: Record<string, unknown> = {}): string => {
      if (typeof stringKey !== 'string' || stringKey.length === 0) return '';
      let base: string | undefined;
      if (strings?.[stringKey]) base = strings[stringKey][userLang] || strings[stringKey][defaultLangShortName];
      if (!base && exrStr?.[stringKey]) base = exrStr[stringKey][userLang] || exrStr[stringKey][defaultLangShortName];
      if (!base && str?.[stringKey]) base = str[stringKey][userLang] || str[stringKey][defaultLangShortName];
      if (!base) return stringKey;
      if (Object.keys(variables).length === 0) return base;
      return base.replace(/\$\{(\w+)\}/g, (m, name) => {
        const v = variables[name];
        return v === undefined || v === null ? m : String(v);
      });
    };
  }, [userLang, exrStr, str, strings]);
};

export default useString;

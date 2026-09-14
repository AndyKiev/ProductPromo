import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, MessageBundle } from '../i18n/types';

export interface StringResource { [key: string]: { [language: string]: string } }
interface TranslationsState {
  languages: Language[];
  selected: Language | null;
  bundles: Record<number, MessageBundle>;
  setLanguages: (languages: Language[]) => void;
  select: (language: Language) => void;
  load: (bundle: MessageBundle) => void;
}
export const useTranslationsStore = create<TranslationsState>()(persist((set) => ({
  languages: [], selected: null, bundles: {},
  setLanguages: (languages) => set({ languages }),
  select: (selected) => set({ selected }),
  load: (bundle) => set((s) => ({ bundles: { ...s.bundles, [bundle.lang_id]: bundle } })),
}), { name: 'productpromo-language', partialize: (s) => ({ selected: s.selected }) }));

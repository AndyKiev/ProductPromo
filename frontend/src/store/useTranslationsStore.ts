import { create } from 'zustand';

export interface StringResource {
  [key: string]: { [language: string]: string };
}

interface TranslationsState {
  strings: StringResource;
  setStrings: (s: StringResource) => void;
}

// DB-managed translations (loaded from a future /full_msgs endpoint). Empty by
// default — static per-feature string tables drive the UI until then.
export const useTranslationsStore = create<TranslationsState>((set) => ({
  strings: {},
  setStrings: (strings) => set({ strings }),
}));

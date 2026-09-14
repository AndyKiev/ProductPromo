export interface Language { id: number; short_name: string; name: string; locale: string }
export interface UserProfile { code: string; name: string; lang_id: number; lang: Language }
export interface MessageBundle { lang_id: number; version: string; messages: Record<string, string> }

// Give the dev account back the language it had before the run (see global-setup.ts).
import { authHeaders, setAccountLanguage } from "./global-setup";

export default async function globalTeardown() {
  const original = Number(process.env.E2E_ORIGINAL_LANG_ID);
  if (!original) return;
  await setAccountLanguage(await authHeaders(), original);
}

// The specs read English labels, and the UI language comes from the ONE dev account's stored
// preference. Switch it to English for the run and hand the original to global-teardown.ts.
const API = `${process.env.BACKEND_URL ?? "http://127.0.0.1:8012"}/api/v1`;
const USERNAME = process.env.AUTH_USERNAME ?? "UKR7101004";
const PASSWORD = process.env.AUTH_PASSWORD ?? "111";

export async function authHeaders(): Promise<Record<string, string>> {
  const res = await fetch(`${API}/jwt/login`, {
    method: "POST",
    body: new URLSearchParams({ username: USERNAME, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`e2e setup: login failed (${res.status}); is the catalog running?`);
  const { access_token } = await res.json();
  return { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" };
}

export async function setAccountLanguage(headers: Record<string, string>, langId: number) {
  const res = await fetch(`${API}/jwt/users/me/language`, {
    method: "PATCH", headers, body: JSON.stringify({ lang_id: langId }),
  });
  if (!res.ok) throw new Error(`e2e: setting account language ${langId} failed (${res.status})`);
}

export default async function globalSetup() {
  const headers = await authHeaders();
  const me = await (await fetch(`${API}/jwt/users/me`, { headers })).json();
  const langs: { id: number; short_name: string }[] = await (await fetch(`${API}/langs`)).json();
  const english = langs.find((l) => l.short_name === "eng");
  if (!english) throw new Error("e2e setup: no 'eng' language");
  // Read by global-teardown.ts, which runs in this same process.
  process.env.E2E_ORIGINAL_LANG_ID = String(me.lang_id ?? "");
  await setAccountLanguage(headers, english.id);
}

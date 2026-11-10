import { Page, expect } from "@playwright/test";

const USERNAME = process.env.AUTH_USERNAME ?? "UKR7101004";
const PASSWORD = process.env.AUTH_PASSWORD ?? "111";

/** Sign in to this app (catalog). promo and employee are separate apps with their own e2e. */
export async function login(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Username").fill(USERNAME);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/nomenclature/);
}

/** Sign out the way a user does (account menu). Clearing localStorage instead races
 *  with in-flight requests: a late setUser() re-persists the in-memory tokens. */
export async function logout(page: Page) {
  await page.getByRole("button", { name: /^(Account|Аккаунт)$/ }).click();
  await page.getByRole("menuitem", { name: /^(Sign out|Выйти)$/ }).click();
  await expect(page).toHaveURL(/\/auth\/login/);
}

export async function getAccessToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.state?.access_token ?? null;
  });
  if (!token) throw new Error("No access token found in localStorage");
  return token;
}

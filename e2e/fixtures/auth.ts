import { Page, expect } from "@playwright/test";

const USERNAME = process.env.AUTH_USERNAME ?? "UKR7101004";
const PASSWORD = process.env.AUTH_PASSWORD ?? "111";

export async function login(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Username").fill(USERNAME);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/nomenclature/);
}

export async function logout(page: Page) {
  await page.evaluate(() => localStorage.clear());
  await page.goto("/");
  await expect(page).toHaveURL(/\/auth\/login/);
}

export async function getAccessToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => {
    const raw = localStorage.getItem("productpromo-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.state?.access_token ?? null;
  });
  if (!token) throw new Error("No access token found in localStorage");
  return token;
}

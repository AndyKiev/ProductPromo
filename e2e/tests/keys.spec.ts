import { test, expect } from "@playwright/test";
import { login } from "../fixtures/auth";

async function setPageSize(page: any, size: number) {
  const selector = page.getByLabel("Rows per page:");
  if (await selector.isVisible({ timeout: 2000 }).catch(() => false)) {
    await selector.click();
    await page.getByRole("option", { name: String(size) }).click();
  }
}

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:8012";
const API = `${BACKEND}/api/v1`;

async function getToken(page: any) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("productpromo-auth");
    if (!raw) return "";
    return JSON.parse(raw).state?.access_token ?? "";
  });
}

async function apiPost(page: any, path: string, data: any) {
  const token = await getToken(page);
  return page.request.fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json;charset=utf-8" },
    data: JSON.stringify(data),
  });
}

async function apiDelete(page: any, path: string) {
  const token = await getToken(page);
  await page.request.fetch(`${API}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

test.describe("Nomenclature Keys CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/nomenclature/keys");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Keys" })).toBeVisible();
    await setPageSize(page, 50);
  });

  test("displays keys list", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
    await expect(page.locator(".MuiDataGrid-root")).toBeVisible();
  });

  test("create a new key", async ({ page }) => {
    const name = `e2e-key-${Date.now()}`;

    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("button", { name: "create" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByRole("gridcell", { name })).toBeVisible();

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: name });
    await row.locator("button").last().click();
    await page.getByRole("button", { name: "delete" }).click();
  });

  test("edit a key", async ({ page }) => {
    const originalName = `e2e-key-${Date.now()}`;
    const updatedName = `e2e-key-upd-${Date.now()}`;

    const keyRes = await apiPost(page, "/nomenclature/keys", { name: originalName });
    const keyJson = await keyRes.json();
    const keyId = keyJson.data.id;

    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: originalName });
    await row.locator("button").first().click();

    const nameInput = page.getByRole("textbox", { name: "Name" });
    await nameInput.clear();
    await nameInput.fill(updatedName);
    await page.getByRole("button", { name: "save" }).click();

    await expect(page.getByRole("gridcell", { name: updatedName })).toBeVisible();
    await apiDelete(page, `/nomenclature/keys/${keyId}`);
  });

  test("delete a key with confirmation", async ({ page }) => {
    const name = `e2e-key-del-${Date.now()}`;
    await apiPost(page, "/nomenclature/keys", { name });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: name });
    await row.locator("button").last().click();
    await expect(page.getByText(/Delete this record/)).toBeVisible();
    await page.getByRole("button", { name: "delete" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole("gridcell", { name })).not.toBeVisible();
  });
});

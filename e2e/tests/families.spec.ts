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

async function createMarket(page: any, name: string) {
  const res = await apiPost(page, "/nomenclature/markets", { name });
  const json = await res.json();
  return json.data;
}

test.describe("Families CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/nomenclature/families");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Family" })).toBeVisible();
    await setPageSize(page, 50);
  });

  test("displays families list", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
    await expect(page.locator(".MuiDataGrid-root")).toBeVisible();
  });

  test("create a family with category reference", async ({ page }) => {
    const market = await createMarket(page, `e2e-market-fam-${Date.now()}`);
    const segRes = await apiPost(page, "/nomenclature/segments", {
      market_id: market.id, status_id: 1, code: "E2E", name: `e2e-segment-fam-${Date.now()}`,
    });
    const segJson = await segRes.json();
    const catRes = await apiPost(page, "/nomenclature/categories", {
      segment_id: segJson.data.id, status_id: 1, code: "E2E", name: `e2e-category-fam-${Date.now()}`,
    });
    const catJson = await catRes.json();
    const category = catJson.data;
    const name = `e2e-family-${Date.now()}`;

    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);

    await page.getByRole("button", { name: "Add" }).click();
    await page.getByRole("textbox", { name: "Code" }).fill("E2E");
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option").filter({ hasText: category.name }).click();
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Active", exact: true }).click();
    await page.getByRole("button", { name: "create" }).click();

    await expect(page.getByRole("gridcell", { name })).toBeVisible();

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: name });
    await row.locator("button").last().click();
    await page.getByRole("button", { name: "delete" }).click();
    await apiDelete(page, `/nomenclature/categories/${category.id}`);
    await apiDelete(page, `/nomenclature/segments/${segJson.data.id}`);
    await apiDelete(page, `/nomenclature/markets/${market.id}`);
  });

  test("edit a family", async ({ page }) => {
    const market = await createMarket(page, `e2e-market-efam-${Date.now()}`);
    const segRes = await apiPost(page, "/nomenclature/segments", {
      market_id: market.id, status_id: 1, code: "E2E", name: `e2e-segment-efam-${Date.now()}`,
    });
    const segJson = await segRes.json();
    const catRes = await apiPost(page, "/nomenclature/categories", {
      segment_id: segJson.data.id, status_id: 1, code: "E2E", name: `e2e-category-efam-${Date.now()}`,
    });
    const catJson = await catRes.json();
    const originalName = `e2e-family-${Date.now()}`;
    const updatedName = `e2e-family-upd-${Date.now()}`;

    const famRes = await apiPost(page, "/nomenclature/families", {
      category_id: catJson.data.id, status_id: 1, code: "E2E", name: originalName,
    });
    const famJson = await famRes.json();
    const famId = famJson.data.id;

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

    await apiDelete(page, `/nomenclature/families/${famId}`);
    await apiDelete(page, `/nomenclature/categories/${catJson.data.id}`);
    await apiDelete(page, `/nomenclature/segments/${segJson.data.id}`);
    await apiDelete(page, `/nomenclature/markets/${market.id}`);
  });

  test("delete a family", async ({ page }) => {
    const market = await createMarket(page, `e2e-market-dfam-${Date.now()}`);
    const segRes = await apiPost(page, "/nomenclature/segments", {
      market_id: market.id, status_id: 1, code: "E2E", name: `e2e-segment-dfam-${Date.now()}`,
    });
    const segJson = await segRes.json();
    const catRes = await apiPost(page, "/nomenclature/categories", {
      segment_id: segJson.data.id, status_id: 1, code: "E2E", name: `e2e-category-dfam-${Date.now()}`,
    });
    const catJson = await catRes.json();
    const name = `e2e-family-del-${Date.now()}`;

    await apiPost(page, "/nomenclature/families", {
      category_id: catJson.data.id, status_id: 1, code: "E2E", name,
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: name });
    await row.locator("button").last().click();
    await page.getByRole("button", { name: "delete" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole("gridcell", { name })).not.toBeVisible();

    await apiDelete(page, `/nomenclature/categories/${catJson.data.id}`);
    await apiDelete(page, `/nomenclature/segments/${segJson.data.id}`);
    await apiDelete(page, `/nomenclature/markets/${market.id}`);
  });
});

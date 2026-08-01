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

test.describe("Nomenclature Links CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/nomenclature/links");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Links" })).toBeVisible();
    await setPageSize(page, 50);
  });

  test("displays links list", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
    await expect(page.locator(".MuiDataGrid-root")).toBeVisible();
  });

  test("create a link with all references", async ({ page }) => {
    const market = await createMarket(page, `e2e-market-link-${Date.now()}`);
    const segRes = await apiPost(page, "/nomenclature/segments", {
      market_id: market.id, status_id: 1, code: "E2E", name: `e2e-segment-link-${Date.now()}`,
    });
    const segJson = await segRes.json();
    const catRes = await apiPost(page, "/nomenclature/categories", {
      segment_id: segJson.data.id, status_id: 1, code: "E2E", name: `e2e-category-link-${Date.now()}`,
    });
    const catJson = await catRes.json();
    const famRes = await apiPost(page, "/nomenclature/families", {
      category_id: catJson.data.id, status_id: 1, code: "E2E", name: `e2e-family-link-${Date.now()}`,
    });
    const famJson = await famRes.json();

    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);

    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("combobox", { name: "Market" }).click();
    await page.getByRole("option", { name: market.name }).click();
    await page.getByRole("combobox", { name: "Segment" }).click();
    await page.getByRole("option").filter({ hasText: segJson.data.name }).click();
    await page.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option").filter({ hasText: catJson.data.name }).click();
    await page.getByRole("combobox", { name: "Family" }).click();
    await page.getByRole("option").filter({ hasText: famJson.data.name }).click();
    await page.getByRole("button", { name: "create" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByRole("gridcell", { name: market.name })).toBeVisible();

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: market.name });
    await row.locator("button").last().click();
    await page.getByRole("button", { name: "delete" }).click();

    await apiDelete(page, `/nomenclature/families/${famJson.data.id}`);
    await apiDelete(page, `/nomenclature/categories/${catJson.data.id}`);
    await apiDelete(page, `/nomenclature/segments/${segJson.data.id}`);
    await apiDelete(page, `/nomenclature/markets/${market.id}`);
  });

  test("delete a link", async ({ page }) => {
    const market = await createMarket(page, `e2e-market-dlink-${Date.now()}`);
    const segRes = await apiPost(page, "/nomenclature/segments", {
      market_id: market.id, status_id: 1, code: "E2E", name: `e2e-segment-dlink-${Date.now()}`,
    });
    const segJson = await segRes.json();
    const catRes = await apiPost(page, "/nomenclature/categories", {
      segment_id: segJson.data.id, status_id: 1, code: "E2E", name: `e2e-category-dlink-${Date.now()}`,
    });
    const catJson = await catRes.json();
    const famRes = await apiPost(page, "/nomenclature/families", {
      category_id: catJson.data.id, status_id: 1, code: "E2E", name: `e2e-family-dlink-${Date.now()}`,
    });
    const famJson = await famRes.json();

    await apiPost(page, "/nomenclature/links", {
      market_id: market.id, segment_id: segJson.data.id, category_id: catJson.data.id, family_id: famJson.data.id,
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: market.name });
    await row.locator("button").last().click();
    await page.getByRole("button", { name: "delete" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole("gridcell", { name: market.name })).not.toBeVisible();

    await apiDelete(page, `/nomenclature/families/${famJson.data.id}`);
    await apiDelete(page, `/nomenclature/categories/${catJson.data.id}`);
    await apiDelete(page, `/nomenclature/segments/${segJson.data.id}`);
    await apiDelete(page, `/nomenclature/markets/${market.id}`);
  });
});

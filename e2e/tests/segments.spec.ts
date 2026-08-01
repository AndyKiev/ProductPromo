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

test.describe("Segments CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/nomenclature/segments");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Segments" })).toBeVisible();
    await setPageSize(page, 50);
  });

  test("displays segments list", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
    await expect(page.locator(".MuiDataGrid-root")).toBeVisible();
  });

  test("create a segment with market and status", async ({ page }) => {
    const market = await createMarket(page, `e2e-market-seg-${Date.now()}`);
    const name = `e2e-segment-${Date.now()}`;

    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);

    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("textbox", { name: "Code" }).fill("E2E");
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("combobox", { name: "Market" }).click();
    await page.getByRole("option", { name: market.name }).click();
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Active", exact: true }).click();
    await page.getByRole("button", { name: "create" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByRole("gridcell", { name })).toBeVisible();

    // cleanup
    const row = page.locator(".MuiDataGrid-row").filter({ hasText: name });
    await row.locator("button").last().click();
    await page.getByRole("button", { name: "delete" }).click();
    await apiDelete(page, `/nomenclature/markets/${market.id}`);
  });

  test("edit a segment", async ({ page }) => {
    const market = await createMarket(page, `e2e-market-editseg-${Date.now()}`);
    const originalName = `e2e-segment-${Date.now()}`;
    const updatedName = `e2e-segment-upd-${Date.now()}`;

    const segRes = await apiPost(page, "/nomenclature/segments", {
      market_id: market.id, status_id: 1, code: "E2E", name: originalName,
    });
    const segJson = await segRes.json();
    const segmentId = segJson.data.id;

    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: originalName });
    await row.locator("button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const nameInput = page.getByRole("textbox", { name: "Name" });
    await nameInput.clear();
    await nameInput.fill(updatedName);
    await page.getByRole("button", { name: "save" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByRole("gridcell", { name: updatedName })).toBeVisible();

    await apiDelete(page, `/nomenclature/segments/${segmentId}`);
    await apiDelete(page, `/nomenclature/markets/${market.id}`);
  });

  test("delete a segment", async ({ page }) => {
    const market = await createMarket(page, `e2e-market-delseg-${Date.now()}`);
    const name = `e2e-segment-del-${Date.now()}`;

    await apiPost(page, "/nomenclature/segments", {
      market_id: market.id, status_id: 1, code: "E2E", name,
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: name });
    await row.locator("button").last().click();
    await expect(page.getByText(/Delete this record/)).toBeVisible();
    await page.getByRole("button", { name: "delete" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole("gridcell", { name })).not.toBeVisible();

    await apiDelete(page, `/nomenclature/markets/${market.id}`);
  });
});

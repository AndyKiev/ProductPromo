import { test, expect } from "@playwright/test";
import { login } from "../fixtures/auth";
import { createMarket, deleteMarket } from "../fixtures/api";

async function setPageSize(page: any, size: number) {
  const footer = page.locator(".MuiDataGrid-footerContainer");
  if ((await footer.count()) === 0) return;
  const select = footer.locator('[role="combobox"]');
  if ((await select.count()) === 0) return;
  await select.click();
  await page.getByRole("option", { name: String(size) }).click();
  await page.waitForTimeout(300);
}

async function goToLastPage(page: any) {
  await page.locator(".MuiDataGrid-row").first().waitFor({ state: "visible", timeout: 10000 });
  const nextBtn = page.locator('[aria-label="Go to next page"]');
  while (await nextBtn.isEnabled().catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(200);
  }
}

test.describe("Markets CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/nomenclature/markets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Markets" })).toBeVisible();
    await setPageSize(page, 50);
  });

  test("displays markets list with add button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
    await expect(page.locator(".MuiDataGrid-root")).toBeVisible();
  });

  test("create a new market", async ({ page }) => {
    const name = `aaa-e2e-market-${Date.now()}`;

    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("button", { name: "create" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await goToLastPage(page);
    await expect(page.locator(".MuiDataGrid-row").filter({ hasText: name })).toBeVisible({ timeout: 10000 });

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: name });
    await row.locator("button").last().click();
    await page.getByRole("button", { name: "delete" }).click();
  });

  test("edit an existing market", async ({ page }) => {
    const originalName = `aaa-e2e-market-${Date.now()}`;
    const updatedName = `aaa-e2e-market-updated-${Date.now()}`;

    const market = await createMarket(page, originalName);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);
    await goToLastPage(page);
    await expect(page.locator(".MuiDataGrid-row").filter({ hasText: originalName })).toBeVisible({ timeout: 10000 });

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: originalName });
    await row.locator("button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const nameInput = page.getByRole("textbox", { name: "Name" });
    await nameInput.clear();
    await nameInput.fill(updatedName);
    await page.getByRole("button", { name: "save" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await goToLastPage(page);
    await expect(page.locator(".MuiDataGrid-row").filter({ hasText: updatedName })).toBeVisible({ timeout: 10000 });

    await deleteMarket(page, market.id);
  });

  test("delete a market with confirmation", async ({ page }) => {
    const name = `aaa-e2e-market-delete-${Date.now()}`;
    const market = await createMarket(page, name);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await setPageSize(page, 50);
    await goToLastPage(page);
    await expect(page.locator(".MuiDataGrid-row").filter({ hasText: name })).toBeVisible({ timeout: 10000 });

    const row = page.locator(".MuiDataGrid-row").filter({ hasText: name });
    await row.locator("button").last().click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Delete this record/)).toBeVisible();
    await page.getByRole("button", { name: "delete" }).click();
    await page.waitForTimeout(500);
    await expect(page.locator(".MuiDataGrid-row").filter({ hasText: name })).not.toBeVisible();
  });

  test("shows error for duplicate name", async ({ page }) => {
    const name = `aaa-e2e-market-dup-${Date.now()}`;
    const market = await createMarket(page, name);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Add" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("button", { name: "create" }).click();

    await expect(page.locator(".MuiAlert-standardError")).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "cancel" }).click();
    await deleteMarket(page, market.id);
  });
});

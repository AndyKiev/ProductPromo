import { test, expect, type Page } from "@playwright/test";
import { login } from "../fixtures/auth";
import { deleteByCode, testCode } from "../fixtures/api";

const toast = (page: Page, re: RegExp) => page.locator("[data-sonner-toast]").filter({ hasText: re }).last();
const title = (page: Page) => page.getByRole("heading").first();

test.describe("Suppliers", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("create, search, edit and delete a supplier; codes are digits only", async ({ page }) => {
    const code = testCode();
    try {
      await page.goto("/admin/suppliers/list");
      await expect(title(page)).toContainText(/Suppliers \(\d/);

      await page.getByRole("button", { name: "Add" }).click();
      await page.locator("#supplier-code").fill("E2E");
      await page.getByRole("button", { name: "create" }).click();
      await expect(page.getByRole("dialog").getByText("digits only")).toBeVisible();

      await page.locator("#supplier-code").fill(code);
      await page.locator("#supplier-name").fill("e2e supplier");
      await page.getByRole("dialog").getByRole("combobox", { name: "Supplier status" }).click();
      await page.getByRole("option").nth(1).click();
      await page.getByRole("button", { name: "create" }).click();
      await expect(toast(page, /created/i)).toContainText(code);

      await page.getByRole("searchbox", { name: "Search" }).fill(code);
      await expect(title(page)).toHaveText("Suppliers (1)");
      const row = page.locator(".MuiDataGrid-row").filter({ hasText: code });

      await row.getByRole("button", { name: "Edit" }).click();
      await page.locator("#supplier-name").fill("e2e supplier edited");
      await page.getByRole("button", { name: "save" }).click();
      await expect(toast(page, /updated/i)).toContainText(code);
      await expect(row).toContainText("e2e supplier edited");

      await row.getByRole("button", { name: "Delete" }).click();
      await page.getByRole("alertdialog").getByRole("button", { name: /delete/i }).click();
      await expect(toast(page, /deleted/i)).toContainText(code);
      await expect(title(page)).toHaveText("Suppliers (0)");
    } finally {
      await deleteByCode(page, "suppliers", code);
    }
  });

  test("status filter narrows the list", async ({ page }) => {
    await page.goto("/admin/suppliers/list");
    await expect(title(page)).toContainText(/Suppliers \(\d/);
    const all = await title(page).textContent();
    await page.getByRole("combobox", { name: "Supplier status" }).click();
    await page.getByRole("option").nth(1).click();
    await expect(title(page)).not.toHaveText(all!);
  });
});

test.describe("Product–supplier links", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("filter by supplier, change a link status in the grid and revert it", async ({ page }) => {
    await page.goto("/admin/suppliers/associations");
    await expect(title(page)).toContainText(/\(\d/);
    const all = await title(page).textContent();

    await page.getByRole("combobox", { name: "Supplier", exact: true }).click();
    await page.keyboard.type("10");
    await page.getByRole("option").first().click();
    await expect(title(page)).not.toHaveText(all!);

    const cell = page.locator(".MuiDataGrid-row").first().getByRole("combobox");
    const before = (await cell.textContent())!.trim();
    await cell.click();
    const names = (await page.getByRole("option").allTextContents()).map((n) => n.trim());
    const target = names.find((n) => n !== before && n !== "any")!;
    await page.getByRole("option", { name: target, exact: true }).click();
    await expect(toast(page, /updated/i)).toBeVisible();
    await expect(cell).toHaveText(target);

    await cell.click();
    await page.getByRole("option", { name: before, exact: true }).click();
    await expect(cell).toHaveText(before);
  });
});

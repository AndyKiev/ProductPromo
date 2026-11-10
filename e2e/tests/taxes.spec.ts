import { test, expect, type Page } from "@playwright/test";
import { login } from "../fixtures/auth";
import { apiRequest } from "../fixtures/api";

const toast = (page: Page, re: RegExp) => page.locator("[data-sonner-toast]").filter({ hasText: re }).last();
const title = (page: Page) => page.getByRole("heading").first();
// A start date no seeded rate uses, so the row (and any leftover) is easy to find.
const FROM_API = "2031-02-01";

async function deleteTestRates(page: Page) {
  const rates = await (await apiRequest(page, "GET", "/tax-rates")).json();
  for (const r of rates) if (r.effective_from === FROM_API) await apiRequest(page, "DELETE", `/tax-rates/${r.id}`);
}

test.describe("Tax rates", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("create with DatePickers (typed and calendar), edit, delete", async ({ page }) => {
    try {
      await page.goto("/admin/products/tax-rates");
      await expect(page.locator(".MuiDataGrid-row").first()).toBeVisible();

      await page.getByRole("button", { name: "Add" }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("button", { name: "create" }).click();
      await expect(dialog.getByText("required").first()).toBeVisible();

      await dialog.getByRole("combobox", { name: /tax type/i }).click();
      await page.getByRole("option").nth(1).click();
      await dialog.getByRole("spinbutton", { name: /rate/i }).fill("7.5");
      await dialog.getByRole("group", { name: /effective from/i }).click();
      await page.keyboard.press("ControlOrMeta+a");
      await page.keyboard.type("01022031");
      await dialog.getByRole("button", { name: /choose date/i }).last().click();
      await page.getByRole("dialog").filter({ has: page.getByRole("grid") }).getByRole("gridcell", { name: "15" }).click();
      await expect(dialog.locator("input").nth(2)).toHaveValue("01.02.2031");
      await expect(dialog.locator("input").nth(3)).toHaveValue(/^15\.\d\d\.\d{4}$/);
      await dialog.getByRole("button", { name: "create" }).click();
      await expect(toast(page, /created/i)).toContainText("7.50%");

      const row = page.locator(".MuiDataGrid-row").filter({ hasText: "2031" });
      await expect(row).toContainText("7.5%");
      await row.getByRole("button", { name: "Edit" }).click();
      await page.getByRole("dialog").getByRole("spinbutton", { name: /rate/i }).fill("8");
      await page.getByRole("dialog").getByRole("button", { name: "save" }).click();
      await expect(toast(page, /updated/i)).toContainText("8.00%");

      await row.getByRole("button", { name: "Delete" }).click();
      await page.getByRole("alertdialog").getByRole("button", { name: /delete/i }).click();
      await expect(toast(page, /deleted/i)).toContainText("8.00%");
      await expect(row).toHaveCount(0);
    } finally {
      await deleteTestRates(page);
    }
  });
});

test.describe("Product taxes", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("tax type filter and search narrow the list", async ({ page }) => {
    await page.goto("/admin/products/product-taxes");
    await expect(title(page)).toContainText(/Product taxes \(\d/);
    const all = (await title(page).textContent())!;
    await page.getByRole("combobox", { name: "Tax type" }).click();
    await page.getByRole("option").nth(1).click();
    await expect(title(page)).not.toHaveText(all);
    const byType = (await title(page).textContent())!;
    await page.getByRole("searchbox", { name: "Search" }).fill("39");
    await expect(title(page)).not.toHaveText(byType);
    await expect(page.locator(".MuiDataGrid-row").first()).toBeVisible();
  });
});

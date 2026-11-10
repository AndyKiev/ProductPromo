import { test, expect, type Page } from "@playwright/test";
import { login } from "../fixtures/auth";
import { deleteByCode, testCode } from "../fixtures/api";

const toast = (page: Page, re: RegExp) => page.locator("[data-sonner-toast]").filter({ hasText: re }).last();
const title = (page: Page) => page.getByRole("heading").first();

/** Pick the n-th real option (0 is "any") of a labelled combobox; returns its text. */
async function pick(page: Page, scope: Page | ReturnType<Page["getByRole"]>, name: string, n = 1) {
  await scope.getByRole("combobox", { name, exact: true }).click();
  const option = page.getByRole("option").nth(n);
  const text = (await option.textContent())!.trim();
  await option.click();
  return text;
}

test.describe("Products", () => {
  // 600k products: the cascade counts and EAN substring search are the heaviest catalog queries.
  // One at a time (one worker, in order), so they don't starve the parallel nomenclature specs.
  test.describe.configure({ mode: "default" });

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/products/list");
    await expect(title(page)).toContainText(/Products \(\d/);
  });

  test("nomenclature cascade filters and reset", async ({ page }) => {
    const all = (await title(page).textContent())!;
    await expect(page.getByRole("combobox", { name: "Segment", exact: true })).toBeDisabled();
    await pick(page, page, "Market");
    await expect(title(page)).not.toHaveText(all);
    const byMarket = (await title(page).textContent())!;
    await pick(page, page, "Segment");
    await expect(title(page)).not.toHaveText(byMarket);
    await page.getByRole("button", { name: /reset filters/i }).click();
    await expect(title(page)).toHaveText(all);
  });

  test("product card lists EANs; EAN search finds the product", async ({ page }) => {
    const first = page.locator(".MuiDataGrid-row").first();
    const code = (await first.locator('[data-field="code"]').textContent())!.trim();
    await first.getByRole("button", { name: /product card/i }).click();
    const card = page.getByRole("dialog");
    await expect(card.getByRole("heading")).toHaveText(`Product ${code}`);
    await expect(card.getByRole("tab")).toContainText("EANs");
    const ean = (await card.locator("li span").first().textContent())!.trim();
    await page.keyboard.press("Escape");

    await page.getByRole("searchbox", { name: "Search by EAN" }).fill(ean);
    await expect(title(page)).toHaveText("Products (1)");
    await expect(page.locator(".MuiDataGrid-row").first().locator('[data-field="code"]')).toHaveText(code);
  });

  test("create with a nomenclature, edit opens with it filled, delete", async ({ page }) => {
    const code = testCode();
    try {
      await page.getByRole("button", { name: "Add" }).click();
      const dialog = page.getByRole("dialog");
      await page.locator("#product-code").fill(code);
      await page.locator("#product-name").fill("e2e product");
      const cascade = [];
      for (const level of ["Market", "Segment", "Category", "Family"]) cascade.push(await pick(page, dialog, level));
      await dialog.getByRole("button", { name: "create" }).click();
      await expect(toast(page, /created/i)).toContainText(code);

      await page.getByRole("searchbox", { name: "Search", exact: true }).fill(code);
      await expect(title(page)).toHaveText("Products (1)");
      const row = page.locator(".MuiDataGrid-row").filter({ hasText: code });

      await row.getByRole("button", { name: "Edit" }).click();
      const shown = await page.getByRole("dialog").getByRole("combobox").allTextContents();
      expect(shown.slice(0, 4).map((s) => s.trim())).toEqual(cascade);
      await page.locator("#product-name").fill("e2e product edited");
      await page.getByRole("dialog").getByRole("button", { name: "save" }).click();
      await expect(toast(page, /updated/i)).toContainText(code);

      await row.getByRole("button", { name: "Delete" }).click();
      await page.getByRole("alertdialog").getByRole("button", { name: /delete/i }).click();
      await expect(toast(page, /deleted/i)).toContainText(code);
      await expect(title(page)).toHaveText("Products (0)");
    } finally {
      await deleteByCode(page, "products", code);
    }
  });
});

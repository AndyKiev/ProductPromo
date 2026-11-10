import { test, expect } from "@playwright/test";
import { login } from "../fixtures/auth";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("tab navigation switches between sections", async ({ page }) => {
    await page.goto("/admin/nomenclature/markets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Markets" })).toBeVisible();

    await page.getByRole("tab", { name: "Segments" }).click();
    await expect(page).toHaveURL(/\/admin\/nomenclature\/segments/);
    await expect(page.getByRole("heading", { name: "Segments" })).toBeVisible();

    await page.getByRole("tab", { name: "Categories" }).click();
    await expect(page).toHaveURL(/\/admin\/nomenclature\/categories/);
    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

    await page.getByRole("tab", { name: "Families" }).click();
    await expect(page).toHaveURL(/\/admin\/nomenclature\/families/);
    await expect(page.getByRole("heading", { name: "Families" })).toBeVisible();

    await page.getByRole("tab", { name: "Keys" }).click();
    await expect(page).toHaveURL(/\/admin\/nomenclature\/keys/);
    await expect(page.getByRole("heading", { name: "Keys" })).toBeVisible();

    await page.getByRole("tab", { name: "Links", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/nomenclature\/links/);
    await expect(page.getByRole("heading", { name: "Links", exact: true })).toBeVisible();
  });

  test("breadcrumbs show navigation path", async ({ page }) => {
    await page.goto("/admin/nomenclature/markets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("navigation", { name: "breadcrumb" }).getByText("Admin")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "breadcrumb" }).getByText("Nomenclature")).toBeVisible();
  });

  test("URL reflects active tab", async ({ page }) => {
    await page.goto("/admin/nomenclature/segments");
    await expect(page).toHaveURL(/\/segments$/);

    await page.goto("/admin/nomenclature/links");
    await expect(page).toHaveURL(/\/links$/);
  });

  test("DataGrid shows rows after loading", async ({ page }) => {
    await page.goto("/admin/nomenclature/markets");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".MuiDataGrid-root")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".MuiDataGrid-columnHeaders")).toBeVisible();
  });
});

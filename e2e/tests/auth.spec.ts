import { test, expect } from "@playwright/test";
import { login, logout } from "../fixtures/auth";

test.describe("Authentication", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole("heading", { name: "ProductPromo" })).toBeVisible();
  });

  test("login form shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("required")).toHaveCount(2);
  });

  test("login fails with invalid credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Username").fill("wrong");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("login succeeds and redirects to nomenclature", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("tab", { name: "Markets" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Segments" })).toBeVisible();
  });

  test("redirects to login after logout", async ({ page }) => {
    await login(page);
    await logout(page);
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("redirects to nomenclature when already logged in", async ({ page }) => {
    await login(page);
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/\/admin\/nomenclature/);
  });
});

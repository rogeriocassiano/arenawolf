import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows Arena Wolf branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Arena Wolf/i);
    await expect(page.getByText("Arena Wolf").first()).toBeVisible();
  });

  test("shows hero headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Premium de BH/i)).toBeVisible();
  });

  test("shows Criar Conta link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /criar conta/i }).first()).toBeVisible();
  });

  test("shows Entrar link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /entrar/i })).toBeVisible();
  });

  test("shows stats section with correct numbers", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("10")).toBeVisible();
    await expect(page.getByText("PCs Gamer")).toBeVisible();
    await expect(page.getByText("3")).toBeVisible();
    await expect(page.getByText("PlayStation 5")).toBeVisible();
  });

  test("shows features section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Status ao Vivo/i)).toBeVisible();
    await expect(page.getByText(/Reserva Online/i)).toBeVisible();
    await expect(page.getByText(/Créditos de Tempo/i)).toBeVisible();
  });

  test("Criar Conta button navigates to /register", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /criar conta grátis/i }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("Entrar link navigates to /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

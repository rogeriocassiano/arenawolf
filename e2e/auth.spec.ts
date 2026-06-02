import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("shows link to register", async ({ page }) => {
    await expect(page.getByRole("link", { name: /criar conta/i })).toBeVisible();
  });

  test("shows link to forgot password", async ({ page }) => {
    await expect(page.getByRole("link", { name: /esqueci/i })).toBeVisible();
  });

  test("shows error for empty form submission", async ({ page }) => {
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.locator("input:invalid")).toHaveCount(2);
  });

  test("shows error for invalid email format", async ({ page }) => {
    await page.fill("input[name=email]", "not-an-email");
    await page.fill("input[name=password]", "password123");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.getByText(/inválido|incorretos/i)).toBeVisible({ timeout: 5000 });
  });

  test("navigates to register when clicking Criar conta", async ({ page }) => {
    await page.getByRole("link", { name: /criar conta/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("navigates to forgot-password link", async ({ page }) => {
    await page.getByRole("link", { name: /esqueci/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("renders register form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
    await expect(page.getByPlaceholder(/nickname/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/senha|characters/i)).toBeVisible();
  });

  test("shows link back to login", async ({ page }) => {
    await expect(page.getByRole("link", { name: /entrar/i })).toBeVisible();
  });

  test("shows error for short nickname", async ({ page }) => {
    await page.fill("input[name=nickname]", "ab");
    await page.fill("input[name=email]", "test@email.com");
    await page.fill("input[name=password]", "password123");
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText(/menos 3|caracteres/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Forgot Password Page", () => {
  test("renders forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: /recuperar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test("shows back to login link", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("link", { name: /voltar/i })).toBeVisible();
  });
});

test.describe("Protected Routes", () => {
  test("redirects /dashboard to /login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects /machines to /login when not authenticated", async ({ page }) => {
    await page.goto("/machines");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects /admin to /login when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});

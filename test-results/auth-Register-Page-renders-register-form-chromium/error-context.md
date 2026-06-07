# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Register Page >> renders register form
- Location: e2e/auth.spec.ts:51:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder(/nickname/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByPlaceholder(/nickname/i)

```

```yaml
- link "Arena Wolf":
  - /url: /
  - img "Arena Wolf"
- heading "Criar Conta" [level=1]
- paragraph: Junte-se à Arena Wolf
- text: Nickname
- textbox "Nickname":
  - /placeholder: WolfPlayer123
- text: E-mail
- textbox "E-mail":
  - /placeholder: seu@email.com
- text: Senha
- textbox "Senha":
  - /placeholder: Mín. 8 caracteres
- paragraph: Ao criar conta você concorda com os Termos de Uso.
- button "Criar Conta"
- paragraph:
  - text: Já tem conta?
  - link "Entrar":
    - /url: /login
- paragraph: Arena Wolf © 2026 · Av. Ivaí, 1178 · Dom Bosco · BH/MG
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Login Page", () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto("/login");
  6   |   });
  7   | 
  8   |   test("renders login form", async ({ page }) => {
  9   |     await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
  10  |     await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  11  |     await expect(page.getByPlaceholder(/senha/i)).toBeVisible();
  12  |     await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  13  |   });
  14  | 
  15  |   test("shows link to register", async ({ page }) => {
  16  |     await expect(page.getByRole("link", { name: /criar conta/i })).toBeVisible();
  17  |   });
  18  | 
  19  |   test("shows link to forgot password", async ({ page }) => {
  20  |     await expect(page.getByRole("link", { name: /esqueci/i })).toBeVisible();
  21  |   });
  22  | 
  23  |   test("shows error for empty form submission", async ({ page }) => {
  24  |     await page.getByRole("button", { name: /entrar/i }).click();
  25  |     await expect(page.locator("input:invalid")).toHaveCount(2);
  26  |   });
  27  | 
  28  |   test("shows error for invalid email format", async ({ page }) => {
  29  |     await page.fill("input[name=email]", "not-an-email");
  30  |     await page.fill("input[name=password]", "password123");
  31  |     await page.getByRole("button", { name: /entrar/i }).click();
  32  |     await expect(page.getByText(/inválido|incorretos/i)).toBeVisible({ timeout: 5000 });
  33  |   });
  34  | 
  35  |   test("navigates to register when clicking Criar conta", async ({ page }) => {
  36  |     await page.getByRole("link", { name: /criar conta/i }).click();
  37  |     await expect(page).toHaveURL(/\/register/);
  38  |   });
  39  | 
  40  |   test("navigates to forgot-password link", async ({ page }) => {
  41  |     await page.getByRole("link", { name: /esqueci/i }).click();
  42  |     await expect(page).toHaveURL(/\/forgot-password/);
  43  |   });
  44  | });
  45  | 
  46  | test.describe("Register Page", () => {
  47  |   test.beforeEach(async ({ page }) => {
  48  |     await page.goto("/register");
  49  |   });
  50  | 
  51  |   test("renders register form", async ({ page }) => {
  52  |     await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
> 53  |     await expect(page.getByPlaceholder(/nickname/i)).toBeVisible();
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  54  |     await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  55  |     await expect(page.getByPlaceholder(/senha|characters/i)).toBeVisible();
  56  |   });
  57  | 
  58  |   test("shows link back to login", async ({ page }) => {
  59  |     await expect(page.getByRole("link", { name: /entrar/i })).toBeVisible();
  60  |   });
  61  | 
  62  |   test("shows error for short nickname", async ({ page }) => {
  63  |     await page.fill("input[name=nickname]", "ab");
  64  |     await page.fill("input[name=email]", "test@email.com");
  65  |     await page.fill("input[name=password]", "password123");
  66  |     await page.getByRole("button", { name: /criar conta/i }).click();
  67  |     await expect(page.getByText(/menos 3|caracteres/i)).toBeVisible({ timeout: 5000 });
  68  |   });
  69  | });
  70  | 
  71  | test.describe("Forgot Password Page", () => {
  72  |   test("renders forgot password form", async ({ page }) => {
  73  |     await page.goto("/forgot-password");
  74  |     await expect(page.getByRole("heading", { name: /recuperar/i })).toBeVisible();
  75  |     await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  76  |   });
  77  | 
  78  |   test("shows back to login link", async ({ page }) => {
  79  |     await page.goto("/forgot-password");
  80  |     await expect(page.getByRole("link", { name: /voltar/i })).toBeVisible();
  81  |   });
  82  | });
  83  | 
  84  | test.describe("Protected Routes", () => {
  85  |   test("redirects /dashboard to /login when not authenticated", async ({ page }) => {
  86  |     await page.goto("/dashboard");
  87  |     await expect(page).toHaveURL(/\/login/);
  88  |   });
  89  | 
  90  |   test("redirects /machines to /login when not authenticated", async ({ page }) => {
  91  |     await page.goto("/machines");
  92  |     await expect(page).toHaveURL(/\/login/);
  93  |   });
  94  | 
  95  |   test("redirects /admin to /login when not authenticated", async ({ page }) => {
  96  |     await page.goto("/admin");
  97  |     await expect(page).toHaveURL(/\/login/);
  98  |   });
  99  | });
  100 | 
```
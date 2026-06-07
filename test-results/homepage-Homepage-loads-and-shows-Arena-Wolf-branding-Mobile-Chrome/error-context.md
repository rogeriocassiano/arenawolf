# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Homepage >> loads and shows Arena Wolf branding
- Location: e2e/homepage.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByText('Arena Wolf').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Arena Wolf').first()
    14 × locator resolved to <span class="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm tracking-wider hidden sm:block">Arena Wolf</span>
       - unexpected value "hidden"

```

```yaml
- banner:
  - img "Arena Wolf"
  - link "Entrar":
    - /url: /login
  - link "Criar Conta":
    - /url: /register
- img "Arena Wolf"
- text: Aberto agora · 08:00 às 22:00
- heading "A Arena Gamer Premium de BH" [level=1]
- paragraph: 10 PCs Gamer + 3 PlayStation 5. Reserve online, veja disponibilidade em tempo real e aproveite a melhor experiência gamer de Belo Horizonte.
- link "Criar Conta Grátis":
  - /url: /register
- link "Já tenho conta":
  - /url: /login
- paragraph: "10"
- paragraph: PCs Gamer
- paragraph: "3"
- paragraph: PlayStation 5
- paragraph: 180Hz
- paragraph: Monitores
- paragraph: 7/7
- paragraph: Dias/semana
- heading "O que você pode fazer" [level=2]
- heading "Status ao Vivo" [level=3]
- paragraph: Veja em tempo real quais máquinas estão livres, ocupadas ou reservadas — sem precisar ligar.
- heading "Reserva Online" [level=3]
- paragraph: Reserve seu PC ou PS5 com antecedência. Seus créditos são descontados automaticamente.
- heading "Créditos de Tempo" [level=3]
- paragraph: Compre pacotes de horas e use quando quiser. Sem fila, sem espera.
- heading "Ranking Gamer" [level=3]
- paragraph: Compita no ranking interno da Arena Wolf em CS2, Valorant, FC25 e muito mais.
- heading "Corujão" [level=3]
- paragraph: Sex→Sáb e Sáb→Dom das 22h às 06h. Reserve sua vaga com 50% antecipado.
- heading "Belo Horizonte" [level=3]
- paragraph: Av. Ivaí, 1178 · Dom Bosco · BH/MG. Todos os dias, 08h às 22h.
- img "Arena Wolf"
- heading "Pronto para jogar?" [level=2]
- paragraph: Crie sua conta grátis e comece a reservar agora mesmo.
- link "Criar Conta Grátis":
  - /url: /register
- contentinfo:
  - paragraph: Arena Wolf © 2026 · Av. Ivaí, 1178 · Dom Bosco · BH/MG · Todos os dias 08h–22h
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Homepage", () => {
  4  |   test("loads and shows Arena Wolf branding", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     await expect(page).toHaveTitle(/Arena Wolf/i);
> 7  |     await expect(page.getByText("Arena Wolf").first()).toBeVisible();
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  8  |   });
  9  | 
  10 |   test("shows hero headline", async ({ page }) => {
  11 |     await page.goto("/");
  12 |     await expect(page.getByText(/Premium de BH/i)).toBeVisible();
  13 |   });
  14 | 
  15 |   test("shows Criar Conta link", async ({ page }) => {
  16 |     await page.goto("/");
  17 |     await expect(page.getByRole("link", { name: /criar conta/i }).first()).toBeVisible();
  18 |   });
  19 | 
  20 |   test("shows Entrar link", async ({ page }) => {
  21 |     await page.goto("/");
  22 |     await expect(page.getByRole("link", { name: /entrar/i })).toBeVisible();
  23 |   });
  24 | 
  25 |   test("shows stats section with correct numbers", async ({ page }) => {
  26 |     await page.goto("/");
  27 |     await expect(page.getByText("10")).toBeVisible();
  28 |     await expect(page.getByText("PCs Gamer")).toBeVisible();
  29 |     await expect(page.getByText("3")).toBeVisible();
  30 |     await expect(page.getByText("PlayStation 5")).toBeVisible();
  31 |   });
  32 | 
  33 |   test("shows features section", async ({ page }) => {
  34 |     await page.goto("/");
  35 |     await expect(page.getByText(/Status ao Vivo/i)).toBeVisible();
  36 |     await expect(page.getByText(/Reserva Online/i)).toBeVisible();
  37 |     await expect(page.getByText(/Créditos de Tempo/i)).toBeVisible();
  38 |   });
  39 | 
  40 |   test("Criar Conta button navigates to /register", async ({ page }) => {
  41 |     await page.goto("/");
  42 |     await page.getByRole("link", { name: /criar conta grátis/i }).first().click();
  43 |     await expect(page).toHaveURL(/\/register/);
  44 |   });
  45 | 
  46 |   test("Entrar link navigates to /login", async ({ page }) => {
  47 |     await page.goto("/");
  48 |     await page.getByRole("link", { name: /entrar/i }).click();
  49 |     await expect(page).toHaveURL(/\/login/);
  50 |   });
  51 | });
  52 | 
```
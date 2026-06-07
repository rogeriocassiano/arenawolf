# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Homepage >> shows stats section with correct numbers
- Location: e2e/homepage.spec.ts:25:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('10')
Expected: visible
Error: strict mode violation: getByText('10') resolved to 2 elements:
    1) <p class="text-wolf-muted text-lg leading-relaxed">10 PCs Gamer + 3 PlayStation 5. Reserve online, v…</p> aka getByText('10 PCs Gamer + 3 PlayStation')
    2) <p class="font-[family-name:var(--font-orbitron)] text-2xl font-black text-wolf-blue-light">10</p> aka getByText('10', { exact: true })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('10')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - img "Arena Wolf" [ref=e5]
        - generic [ref=e6]: Arena Wolf
      - generic [ref=e7]:
        - link "Entrar" [ref=e8] [cursor=pointer]:
          - /url: /login
        - link "Criar Conta" [ref=e9] [cursor=pointer]:
          - /url: /register
    - generic [ref=e10]:
      - generic [ref=e11]:
        - img "Arena Wolf" [ref=e12]
        - generic [ref=e15]: Aberto agora · 08:00 às 22:00
      - generic [ref=e16]:
        - heading "A Arena Gamer Premium de BH" [level=1] [ref=e17]:
          - text: A Arena Gamer
          - generic [ref=e18]: Premium de BH
        - paragraph [ref=e19]: 10 PCs Gamer + 3 PlayStation 5. Reserve online, veja disponibilidade em tempo real e aproveite a melhor experiência gamer de Belo Horizonte.
      - generic [ref=e20]:
        - link "Criar Conta Grátis" [ref=e21] [cursor=pointer]:
          - /url: /register
        - link "Já tenho conta" [ref=e22] [cursor=pointer]:
          - /url: /login
    - generic [ref=e24]:
      - generic [ref=e25]:
        - img [ref=e26]
        - paragraph [ref=e28]: "10"
        - paragraph [ref=e29]: PCs Gamer
      - generic [ref=e30]:
        - img [ref=e31]
        - paragraph [ref=e33]: "3"
        - paragraph [ref=e34]: PlayStation 5
      - generic [ref=e35]:
        - img [ref=e36]
        - paragraph [ref=e39]: 180Hz
        - paragraph [ref=e40]: Monitores
      - generic [ref=e41]:
        - img [ref=e42]
        - paragraph [ref=e44]: 7/7
        - paragraph [ref=e45]: Dias/semana
    - generic [ref=e47]:
      - heading "O que você pode fazer" [level=2] [ref=e48]
      - generic [ref=e49]:
        - generic [ref=e50]:
          - img [ref=e52]
          - heading "Status ao Vivo" [level=3] [ref=e54]
          - paragraph [ref=e55]: Veja em tempo real quais máquinas estão livres, ocupadas ou reservadas — sem precisar ligar.
        - generic [ref=e56]:
          - img [ref=e58]
          - heading "Reserva Online" [level=3] [ref=e60]
          - paragraph [ref=e61]: Reserve seu PC ou PS5 com antecedência. Seus créditos são descontados automaticamente.
        - generic [ref=e62]:
          - img [ref=e64]
          - heading "Créditos de Tempo" [level=3] [ref=e67]
          - paragraph [ref=e68]: Compre pacotes de horas e use quando quiser. Sem fila, sem espera.
        - generic [ref=e69]:
          - img [ref=e71]
          - heading "Ranking Gamer" [level=3] [ref=e77]
          - paragraph [ref=e78]: Compita no ranking interno da Arena Wolf em CS2, Valorant, FC25 e muito mais.
        - generic [ref=e79]:
          - img [ref=e81]
          - heading "Corujão" [level=3] [ref=e83]
          - paragraph [ref=e84]: Sex→Sáb e Sáb→Dom das 22h às 06h. Reserve sua vaga com 50% antecipado.
        - generic [ref=e85]:
          - img [ref=e87]
          - heading "Belo Horizonte" [level=3] [ref=e90]
          - paragraph [ref=e91]: Av. Ivaí, 1178 · Dom Bosco · BH/MG. Todos os dias, 08h às 22h.
    - generic [ref=e93]:
      - img "Arena Wolf" [ref=e94]
      - heading "Pronto para jogar?" [level=2] [ref=e95]
      - paragraph [ref=e96]: Crie sua conta grátis e comece a reservar agora mesmo.
      - link "Criar Conta Grátis" [ref=e97] [cursor=pointer]:
        - /url: /register
    - contentinfo [ref=e98]:
      - paragraph [ref=e99]: Arena Wolf © 2026 · Av. Ivaí, 1178 · Dom Bosco · BH/MG · Todos os dias 08h–22h
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e105] [cursor=pointer]:
    - img [ref=e106]
  - alert [ref=e109]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Homepage", () => {
  4  |   test("loads and shows Arena Wolf branding", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     await expect(page).toHaveTitle(/Arena Wolf/i);
  7  |     await expect(page.getByText("Arena Wolf").first()).toBeVisible();
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
> 27 |     await expect(page.getByText("10")).toBeVisible();
     |                                        ^ Error: expect(locator).toBeVisible() failed
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
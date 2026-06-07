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
      - img "Arena Wolf" [ref=e5]
      - generic [ref=e6]:
        - link "Entrar" [ref=e7] [cursor=pointer]:
          - /url: /login
        - link "Criar Conta" [ref=e8] [cursor=pointer]:
          - /url: /register
    - generic [ref=e9]:
      - generic [ref=e10]:
        - img "Arena Wolf" [ref=e11]
        - generic [ref=e14]: Aberto agora · 08:00 às 22:00
      - generic [ref=e15]:
        - heading "A Arena Gamer Premium de BH" [level=1] [ref=e16]:
          - text: A Arena Gamer
          - generic [ref=e17]: Premium de BH
        - paragraph [ref=e18]: 10 PCs Gamer + 3 PlayStation 5. Reserve online, veja disponibilidade em tempo real e aproveite a melhor experiência gamer de Belo Horizonte.
      - generic [ref=e19]:
        - link "Criar Conta Grátis" [ref=e20] [cursor=pointer]:
          - /url: /register
        - link "Já tenho conta" [ref=e21] [cursor=pointer]:
          - /url: /login
    - generic [ref=e23]:
      - generic [ref=e24]:
        - img [ref=e25]
        - paragraph [ref=e27]: "10"
        - paragraph [ref=e28]: PCs Gamer
      - generic [ref=e29]:
        - img [ref=e30]
        - paragraph [ref=e32]: "3"
        - paragraph [ref=e33]: PlayStation 5
      - generic [ref=e34]:
        - img [ref=e35]
        - paragraph [ref=e38]: 180Hz
        - paragraph [ref=e39]: Monitores
      - generic [ref=e40]:
        - img [ref=e41]
        - paragraph [ref=e43]: 7/7
        - paragraph [ref=e44]: Dias/semana
    - generic [ref=e46]:
      - heading "O que você pode fazer" [level=2] [ref=e47]
      - generic [ref=e48]:
        - generic [ref=e49]:
          - img [ref=e51]
          - heading "Status ao Vivo" [level=3] [ref=e53]
          - paragraph [ref=e54]: Veja em tempo real quais máquinas estão livres, ocupadas ou reservadas — sem precisar ligar.
        - generic [ref=e55]:
          - img [ref=e57]
          - heading "Reserva Online" [level=3] [ref=e59]
          - paragraph [ref=e60]: Reserve seu PC ou PS5 com antecedência. Seus créditos são descontados automaticamente.
        - generic [ref=e61]:
          - img [ref=e63]
          - heading "Créditos de Tempo" [level=3] [ref=e66]
          - paragraph [ref=e67]: Compre pacotes de horas e use quando quiser. Sem fila, sem espera.
        - generic [ref=e68]:
          - img [ref=e70]
          - heading "Ranking Gamer" [level=3] [ref=e76]
          - paragraph [ref=e77]: Compita no ranking interno da Arena Wolf em CS2, Valorant, FC25 e muito mais.
        - generic [ref=e78]:
          - img [ref=e80]
          - heading "Corujão" [level=3] [ref=e82]
          - paragraph [ref=e83]: Sex→Sáb e Sáb→Dom das 22h às 06h. Reserve sua vaga com 50% antecipado.
        - generic [ref=e84]:
          - img [ref=e86]
          - heading "Belo Horizonte" [level=3] [ref=e89]
          - paragraph [ref=e90]: Av. Ivaí, 1178 · Dom Bosco · BH/MG. Todos os dias, 08h às 22h.
    - generic [ref=e92]:
      - img "Arena Wolf" [ref=e93]
      - heading "Pronto para jogar?" [level=2] [ref=e94]
      - paragraph [ref=e95]: Crie sua conta grátis e comece a reservar agora mesmo.
      - link "Criar Conta Grátis" [ref=e96] [cursor=pointer]:
        - /url: /register
    - contentinfo [ref=e97]:
      - paragraph [ref=e98]: Arena Wolf © 2026 · Av. Ivaí, 1178 · Dom Bosco · BH/MG · Todos os dias 08h–22h
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e104] [cursor=pointer]:
    - img [ref=e105]
  - alert [ref=e108]
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
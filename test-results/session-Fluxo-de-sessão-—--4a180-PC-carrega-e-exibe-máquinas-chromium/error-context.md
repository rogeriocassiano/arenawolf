# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: session.spec.ts >> Fluxo de sessão — usuário >> página Usar PC carrega e exibe máquinas
- Location: e2e/session.spec.ts:22:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Usar.*PC/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /Usar.*PC/i })

```

```yaml
- banner:
  - link "Arena Wolf Arena Wolf":
    - /url: /dashboard
    - img "Arena Wolf"
    - text: Arena Wolf
  - text: 18h créditos
  - link "WO":
    - /url: /profile
- complementary:
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "Usar PC":
      - /url: /session
    - link "Máquinas":
      - /url: /machines
    - link "Reservas":
      - /url: /reservations
    - link "Loja":
      - /url: /store
    - link "Eventos":
      - /url: /events
    - link "Promoções":
      - /url: /promotions
    - link "Ranking":
      - /url: /ranking
    - link "Suporte":
      - /url: /support
    - link "Perfil":
      - /url: /profile
    - button "Sair"
- main:
  - heading "Minha Sessão" [level=1]
  - paragraph: Ao vivo
  - paragraph: Sessão Ativa
  - paragraph: Wolf 08
  - text: ATIVA
  - paragraph: Tempo restante
  - text: 00:00
  - button "Encerrar Sessão"
  - paragraph: Créditos são descontados ao encerrar. O PC é bloqueado automaticamente quando o tempo acaba.
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | import { test, expect, Page } from "@playwright/test";
  2   | 
  3   | async function loginAsUser(page: Page) {
  4   |   await page.goto("/login");
  5   |   // Clicar no campo e digitar caractere por caractere (bypassa validação HTML type=email)
  6   |   await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL ?? "user@user.com");
  7   |   await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD ?? "12345678");
  8   |   await page.click('button[type="submit"]');
  9   |   await page.waitForURL("**/dashboard", { timeout: 15000 });
  10  | }
  11  | 
  12  | async function loginAsAdmin(page: Page) {
  13  |   await page.goto("/login");
  14  |   await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL ?? "luan@arenawolf.com");
  15  |   await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD ?? "12345678");
  16  |   await page.click('button[type="submit"]');
  17  |   // Admin pode redirecionar para /dashboard ou /admin dependendo da configuração
  18  |   await page.waitForURL(/dashboard|admin/, { timeout: 15000 });
  19  | }
  20  | 
  21  | test.describe("Fluxo de sessão — usuário", () => {
  22  |   test("página Usar PC carrega e exibe máquinas", async ({ page }) => {
  23  |     await loginAsUser(page);
  24  |     await page.goto("/session");
  25  |     await page.waitForLoadState("domcontentloaded");
  26  |     // Heading da página e lista de máquinas (Wolf 01, PS5 01, etc)
> 27  |     await expect(page.getByRole("heading", { name: /Usar.*PC/i })).toBeVisible({ timeout: 10000 });
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  28  |     await expect(page.getByText(/Wolf \d+|PS5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  29  |   });
  30  | 
  31  |   test("botão Gerar PIN desabilitado sem máquina selecionada", async ({ page }) => {
  32  |     await loginAsUser(page);
  33  |     await page.goto("/session");
  34  |     const btn = page.getByRole("button", { name: /PIN|Gerar|Usar PC/i }).first();
  35  |     await expect(btn).toBeVisible();
  36  |   });
  37  | 
  38  |   test("sidebar contém link Usar PC", async ({ page }) => {
  39  |     await loginAsUser(page);
  40  |     await page.goto("/dashboard");
  41  |     await expect(page.getByRole("link", { name: /Usar PC/i })).toBeVisible();
  42  |   });
  43  | 
  44  |   test.skip("skip user@user — email inválido para browser", () => {});
  45  | });
  46  | 
  47  | test.describe("Painel Operador — admin", () => {
  48  |   test("painel operador carrega com grid de máquinas", async ({ page }) => {
  49  |     await loginAsAdmin(page);
  50  |     await page.goto("/admin/operator");
  51  |     await page.waitForLoadState("domcontentloaded");
  52  |     await expect(page.getByRole("heading", { name: /Painel Operador/i })).toBeVisible({ timeout: 10000 });
  53  |     // Grid de máquinas — aguardar dados Realtime carregarem (Wolf 01, PS5 01, etc)
  54  |     await expect(page.getByText(/Wolf \d+|PS5 \d+/i).first()).toBeVisible({ timeout: 20000 });
  55  |   });
  56  | 
  57  |   test("sidebar admin contém link Painel Operador", async ({ page }) => {
  58  |     await loginAsAdmin(page);
  59  |     await page.goto("/admin/operator");
  60  |     await page.waitForLoadState("domcontentloaded");
  61  |     // Em desktop o sidebar é visível, em mobile usa menu hamburguer
  62  |     const isDesktop = page.viewportSize()!.width > 768;
  63  |     if (isDesktop) {
  64  |       await expect(page.getByRole("link", { name: /Painel Operador/i })).toBeVisible();
  65  |     } else {
  66  |       await expect(page.getByRole("heading", { name: /Painel Operador/i })).toBeVisible({ timeout: 10000 });
  67  |     }
  68  |   });
  69  | 
  70  |   test("KPIs visíveis no painel operador", async ({ page }) => {
  71  |     await loginAsAdmin(page);
  72  |     await page.goto("/admin/operator");
  73  |     await page.waitForLoadState("domcontentloaded");
  74  |     // KPIs estão em uppercase via CSS: EM USO, DISPONÍVEIS, SESSÕES ATIVAS
  75  |     await expect(page.locator(".text-wolf-muted").filter({ hasText: /uso|dispon|sess/i }).first()).toBeVisible({ timeout: 10000 });
  76  |   });
  77  | 
  78  |   test("botão Iniciar Sessão abre modal", async ({ page }) => {
  79  |     await loginAsAdmin(page);
  80  |     await page.goto("/admin/operator");
  81  |     const startBtn = page.getByRole("button", { name: /Iniciar Sess/i }).first();
  82  |     await expect(startBtn).toBeVisible({ timeout: 10000 });
  83  |     await startBtn.click();
  84  |     // Modal — aguardar qualquer elemento que apareça dentro do modal
  85  |     await expect(page.getByText(/selecionar|usuário|minutos|iniciar/i).nth(1)).toBeVisible({ timeout: 8000 });
  86  |   });
  87  | });
  88  | 
  89  | test.describe("API de sessão", () => {
  90  |   test("POST /api/session/pin sem autenticação retorna 401", async ({ request }) => {
  91  |     const res = await request.post("/api/session/pin", {
  92  |       data: { machine_id: "00000000-0000-0000-0000-000000000000" },
  93  |     });
  94  |     expect(res.status()).toBe(401);
  95  |   });
  96  | 
  97  |   test("POST /api/session/start sem autenticação retorna 401", async ({ request }) => {
  98  |     const res = await request.post("/api/session/start", {
  99  |       data: { machine_id: "test", user_id: "test", minutes: 60 },
  100 |     });
  101 |     expect(res.status()).toBe(401);
  102 |   });
  103 | 
  104 |   test("POST /api/session/end sem autenticação retorna 401", async ({ request }) => {
  105 |     const res = await request.post("/api/session/end", {
  106 |       data: { session_id: "test" },
  107 |     });
  108 |     expect(res.status()).toBe(401);
  109 |   });
  110 | });
  111 | 
```
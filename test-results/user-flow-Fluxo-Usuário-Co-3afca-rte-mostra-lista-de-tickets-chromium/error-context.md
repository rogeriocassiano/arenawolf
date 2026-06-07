# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-flow.spec.ts >> Fluxo Usuário Completo >> página de suporte mostra lista de tickets
- Location: e2e/user-flow.spec.ts:94:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /suporte|tickets/i })
Expected: visible
Error: strict mode violation: getByRole('heading', { name: /suporte|tickets/i }) resolved to 2 elements:
    1) <h1 class="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Suporte</h1> aka getByRole('heading', { name: 'Suporte' })
    2) <h2 class="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide">Meus Tickets</h2> aka getByRole('heading', { name: 'Meus Tickets' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /suporte|tickets/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Arena Wolf Arena Wolf" [ref=e4] [cursor=pointer]:
        - /url: /dashboard
        - img "Arena Wolf" [ref=e5]
        - generic [ref=e6]: Arena Wolf
      - generic [ref=e7]:
        - img [ref=e8]
        - generic [ref=e11]: 18h
        - generic [ref=e12]: créditos
      - link "WO" [ref=e13] [cursor=pointer]:
        - /url: /profile
        - generic [ref=e15]: WO
    - generic [ref=e16]:
      - complementary [ref=e17]:
        - navigation [ref=e18]:
          - link "Dashboard" [ref=e19] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e20]
            - generic [ref=e25]: Dashboard
          - link "Usar PC" [ref=e26] [cursor=pointer]:
            - /url: /session
            - img [ref=e27]
            - generic [ref=e29]: Usar PC
          - link "Máquinas" [ref=e30] [cursor=pointer]:
            - /url: /machines
            - img [ref=e31]
            - generic [ref=e33]: Máquinas
          - link "Reservas" [ref=e34] [cursor=pointer]:
            - /url: /reservations
            - img [ref=e35]
            - generic [ref=e39]: Reservas
          - link "Loja" [ref=e40] [cursor=pointer]:
            - /url: /store
            - img [ref=e41]
            - generic [ref=e44]: Loja
          - link "Eventos" [ref=e45] [cursor=pointer]:
            - /url: /events
            - img [ref=e46]
            - generic [ref=e51]: Eventos
          - link "Promoções" [ref=e52] [cursor=pointer]:
            - /url: /promotions
            - img [ref=e53]
            - generic [ref=e56]: Promoções
          - link "Ranking" [ref=e57] [cursor=pointer]:
            - /url: /ranking
            - img [ref=e58]
            - generic [ref=e64]: Ranking
          - link "Suporte" [ref=e65] [cursor=pointer]:
            - /url: /support
            - img [ref=e66]
            - generic [ref=e68]: Suporte
          - link "Perfil" [ref=e70] [cursor=pointer]:
            - /url: /profile
            - img [ref=e71]
            - generic [ref=e74]: Perfil
          - button "Sair" [ref=e78]:
            - img [ref=e79]
            - generic [ref=e82]: Sair
      - main [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]:
            - generic [ref=e86]:
              - heading "Suporte" [level=1] [ref=e87]
              - paragraph [ref=e88]: Fale com nossa equipe
            - link "Novo ticket" [ref=e89] [cursor=pointer]:
              - /url: /support/new
              - button "Novo ticket" [ref=e90]:
                - img [ref=e91]
                - text: Novo ticket
          - generic [ref=e93]:
            - generic [ref=e94]:
              - img [ref=e95]
              - generic [ref=e98]:
                - paragraph [ref=e99]: Horário
                - paragraph [ref=e100]: Seg–Dom · 08h às 22h
            - generic [ref=e101]:
              - img [ref=e102]
              - generic [ref=e104]:
                - paragraph [ref=e105]: Resposta
                - paragraph [ref=e106]: Em até 2 horas
            - generic [ref=e107]:
              - img [ref=e108]
              - generic [ref=e111]:
                - paragraph [ref=e112]: WhatsApp
                - paragraph [ref=e113]: (31) 9xxxx-xxxx
          - generic [ref=e114]:
            - heading "Meus Tickets" [level=2] [ref=e115]
            - generic [ref=e116]:
              - img [ref=e117]
              - paragraph [ref=e119]: Nenhum ticket ainda
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e125] [cursor=pointer]:
    - img [ref=e126]
  - alert [ref=e129]
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests — Fluxo completo do usuário
  3   |  * Dashboard → Session → Store → Reservations → Support
  4   |  */
  5   | 
  6   | import { test, expect, Page } from "@playwright/test";
  7   | 
  8   | const TEST_USER = {
  9   |   email: process.env.TEST_USER_EMAIL ?? "user@user.com",
  10  |   password: process.env.TEST_USER_PASSWORD ?? "12345678",
  11  | };
  12  | 
  13  | async function loginAsUser(page: Page) {
  14  |   await page.goto("/login");
  15  |   await page.fill('input[type="email"]', TEST_USER.email);
  16  |   await page.fill('input[type="password"]', TEST_USER.password);
  17  |   await page.click('button[type="submit"]');
  18  |   await page.waitForURL("**/dashboard", { timeout: 15000 });
  19  | }
  20  | 
  21  | test.describe("Fluxo Usuário Completo", () => {
  22  |   test.beforeEach(async ({ page }) => {
  23  |     await loginAsUser(page);
  24  |   });
  25  | 
  26  |   test("dashboard carrega com sidebar e KPIs", async ({ page }) => {
  27  |     await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 10000 });
  28  |     await expect(page.getByText(/créditos|minutos/i)).toBeVisible();
  29  |     // Sidebar links
  30  |     await expect(page.getByRole("link", { name: /usar pc/i })).toBeVisible();
  31  |     await expect(page.getByRole("link", { name: /reservas/i })).toBeVisible();
  32  |     await expect(page.getByRole("link", { name: /loja/i })).toBeVisible();
  33  |     await expect(page.getByRole("link", { name: /suporte/i })).toBeVisible();
  34  |   });
  35  | 
  36  |   test("navegação para /session mostra lista de máquinas", async ({ page }) => {
  37  |     await page.goto("/session");
  38  |     await page.waitForLoadState("domcontentloaded");
  39  |     await expect(page.getByRole("heading", { name: /usar.*pc/i })).toBeVisible({ timeout: 10000 });
  40  |     // Pelo menos uma máquina deve aparecer
  41  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  42  |   });
  43  | 
  44  |   test("selecionar máquina habilita botão de gerar PIN", async ({ page }) => {
  45  |     await page.goto("/session");
  46  |     await page.waitForLoadState("domcontentloaded");
  47  |     // Aguarda máquinas carregarem
  48  |     await page.waitForSelector('[data-testid="machine-card"], text=/Wolf|PS5/', { timeout: 15000 });
  49  |     // Clica na primeira máquina disponível
  50  |     const machineCard = page.locator('[data-testid="machine-card"], text=/Wolf|PS5/').first();
  51  |     await machineCard.click();
  52  |     // Botão deve ficar habilitado
  53  |     const btn = page.getByRole("button", { name: /gerar.*pin|usar.*pc/i }).first();
  54  |     await expect(btn).toBeEnabled();
  55  |   });
  56  | 
  57  |   test("página de loja mostra pacotes de crédito", async ({ page }) => {
  58  |     await page.goto("/store");
  59  |     await expect(page.getByRole("heading", { name: /loja|créditos/i })).toBeVisible({ timeout: 10000 });
  60  |     // Pacotes devem estar visíveis
  61  |     await expect(page.getByText(/1 hora|2 horas|corujão|10 horas/i).first()).toBeVisible();
  62  |   });
  63  | 
  64  |   test("solicitar pacote de crédito cria solicitação pendente", async ({ page }) => {
  65  |     await page.goto("/store");
  66  |     await page.waitForLoadState("networkidle");
  67  |     // Clica no primeiro botão de comprar
  68  |     const buyBtn = page.getByRole("button", { name: /comprar|solicitar/i }).first();
  69  |     await buyBtn.click();
  70  |     // Deve mostrar confirmação ou toast
  71  |     await expect(page.getByText(/solicitação|pendente|balcão/i).first()).toBeVisible({ timeout: 5000 });
  72  |   });
  73  | 
  74  |   test("página de reservas mostra formulário", async ({ page }) => {
  75  |     await page.goto("/reservations");
  76  |     await expect(page.getByRole("heading", { name: /reserva/i })).toBeVisible({ timeout: 10000 });
  77  |     await expect(page.getByLabel(/máquina/i)).toBeVisible();
  78  |     await expect(page.getByLabel(/data|quando/i)).toBeVisible();
  79  |     await expect(page.getByLabel(/duração|tempo/i)).toBeVisible();
  80  |   });
  81  | 
  82  |   test("criar reserva com dados válidos", async ({ page }) => {
  83  |     await page.goto("/reservations");
  84  |     await page.waitForLoadState("domcontentloaded");
  85  |     // Preenche formulário
  86  |     await page.selectOption('select[name="machine_id"]', { index: 1 });
  87  |     await page.fill('input[name="start_at"]', new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  88  |     await page.fill('input[name="duration_min"]', "60");
  89  |     await page.getByRole("button", { name: /reservar|confirmar/i }).click();
  90  |     // Sucesso ou erro de créditos (ambos são respostas válidas da API)
  91  |     await expect(page.getByText(/sucesso|reservado|créditos|insuficientes/i).first()).toBeVisible({ timeout: 5000 });
  92  |   });
  93  | 
  94  |   test("página de suporte mostra lista de tickets", async ({ page }) => {
  95  |     await page.goto("/support");
> 96  |     await expect(page.getByRole("heading", { name: /suporte|tickets/i })).toBeVisible({ timeout: 10000 });
      |                                                                           ^ Error: expect(locator).toBeVisible() failed
  97  |     // Botão de novo ticket
  98  |     await expect(page.getByRole("link", { name: /novo ticket|abrir chamado/i })).toBeVisible();
  99  |   });
  100 | 
  101 |   test("criar novo ticket de suporte", async ({ page }) => {
  102 |     await page.goto("/support/new");
  103 |     await expect(page.getByRole("heading", { name: /novo ticket/i })).toBeVisible({ timeout: 10000 });
  104 |     await page.fill('input[name="subject"]', "Problema de teste E2E");
  105 |     await page.fill('textarea[name="body"]', "Este é um ticket de teste automatizado.");
  106 |     await page.getByRole("button", { name: /enviar|criar/i }).click();
  107 |     // Redireciona para detalhes do ticket ou lista
  108 |     await expect(page).toHaveURL(/support/, { timeout: 5000 });
  109 |   });
  110 | 
  111 |   test("perfil do usuário mostra dados pessoais", async ({ page }) => {
  112 |     await page.goto("/profile");
  113 |     await expect(page.getByRole("heading", { name: /perfil|minha conta/i })).toBeVisible({ timeout: 10000 });
  114 |     await expect(page.getByLabel(/nickname|nome/i)).toBeVisible();
  115 |     await expect(page.getByLabel(/email/i)).toBeVisible();
  116 |   });
  117 | });
  118 | 
```
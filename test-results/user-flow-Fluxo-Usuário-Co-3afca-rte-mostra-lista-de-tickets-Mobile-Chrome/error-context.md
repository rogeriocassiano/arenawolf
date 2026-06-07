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
      - button "Abrir menu" [ref=e4]:
        - img [ref=e5]
      - link "Arena Wolf" [ref=e6] [cursor=pointer]:
        - /url: /dashboard
        - img "Arena Wolf" [ref=e7]
      - generic [ref=e8]:
        - img [ref=e9]
        - generic [ref=e12]: 18h
      - link "WO" [ref=e13] [cursor=pointer]:
        - /url: /profile
        - generic [ref=e15]: WO
    - complementary [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e20]: WO
          - generic [ref=e21]: WolfUser
        - button [ref=e22]:
          - img [ref=e23]
      - navigation [ref=e27]:
        - link "Dashboard" [ref=e28] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e29]
          - generic [ref=e34]: Dashboard
        - link "Usar PC" [ref=e35] [cursor=pointer]:
          - /url: /session
          - img [ref=e36]
          - generic [ref=e38]: Usar PC
        - link "Máquinas" [ref=e39] [cursor=pointer]:
          - /url: /machines
          - img [ref=e40]
          - generic [ref=e42]: Máquinas
        - link "Reservas" [ref=e43] [cursor=pointer]:
          - /url: /reservations
          - img [ref=e44]
          - generic [ref=e48]: Reservas
        - link "Loja" [ref=e49] [cursor=pointer]:
          - /url: /store
          - img [ref=e50]
          - generic [ref=e53]: Loja
        - link "Eventos" [ref=e54] [cursor=pointer]:
          - /url: /events
          - img [ref=e55]
          - generic [ref=e60]: Eventos
        - link "Promoções" [ref=e61] [cursor=pointer]:
          - /url: /promotions
          - img [ref=e62]
          - generic [ref=e65]: Promoções
        - link "Ranking" [ref=e66] [cursor=pointer]:
          - /url: /ranking
          - img [ref=e67]
          - generic [ref=e73]: Ranking
        - link "Suporte" [ref=e74] [cursor=pointer]:
          - /url: /support
          - img [ref=e75]
          - generic [ref=e77]: Suporte
        - link "Perfil" [ref=e79] [cursor=pointer]:
          - /url: /profile
          - img [ref=e80]
          - generic [ref=e83]: Perfil
        - button "Sair" [ref=e87]:
          - img [ref=e88]
          - generic [ref=e91]: Sair
    - main [ref=e93]:
      - generic [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]:
            - heading "Suporte" [level=1] [ref=e97]
            - paragraph [ref=e98]: Fale com nossa equipe
          - link "Novo ticket" [ref=e99] [cursor=pointer]:
            - /url: /support/new
            - button "Novo ticket" [ref=e100]:
              - img [ref=e101]
              - text: Novo ticket
        - generic [ref=e103]:
          - generic [ref=e104]:
            - img [ref=e105]
            - generic [ref=e108]:
              - paragraph [ref=e109]: Horário
              - paragraph [ref=e110]: Seg–Dom · 08h às 22h
          - generic [ref=e111]:
            - img [ref=e112]
            - generic [ref=e114]:
              - paragraph [ref=e115]: Resposta
              - paragraph [ref=e116]: Em até 2 horas
          - generic [ref=e117]:
            - img [ref=e118]
            - generic [ref=e121]:
              - paragraph [ref=e122]: WhatsApp
              - paragraph [ref=e123]: (31) 9xxxx-xxxx
        - generic [ref=e124]:
          - heading "Meus Tickets" [level=2] [ref=e125]
          - generic [ref=e126]:
            - img [ref=e127]
            - paragraph [ref=e129]: Nenhum ticket ainda
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e135] [cursor=pointer]:
    - img [ref=e136]
  - alert [ref=e139]
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
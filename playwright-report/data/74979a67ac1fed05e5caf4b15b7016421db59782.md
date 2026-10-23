# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-flow.spec.ts >> Fluxo Usuário Completo >> página de suporte mostra lista de tickets
- Location: e2e\user-flow.spec.ts:84:7

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
        - generic [ref=e12]: 2h
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
          - link "Problema de teste E2E 21/10/2026, 04:34 Aberto" [ref=e126] [cursor=pointer]:
            - /url: /support/ae8e3d92-b724-449c-bbb1-f108d4efcaf9
            - generic [ref=e127]:
              - img [ref=e128]
              - generic [ref=e130]:
                - paragraph [ref=e131]: Problema de teste E2E
                - paragraph [ref=e132]: 21/10/2026, 04:34
              - generic [ref=e133]:
                - img [ref=e134]
                - text: Aberto
          - link "Problema de teste E2E 21/10/2026, 04:09 Aberto" [ref=e136] [cursor=pointer]:
            - /url: /support/489235b8-dd1a-40ce-8e48-9f7022ea1d3e
            - generic [ref=e137]:
              - img [ref=e138]
              - generic [ref=e140]:
                - paragraph [ref=e141]: Problema de teste E2E
                - paragraph [ref=e142]: 21/10/2026, 04:09
              - generic [ref=e143]:
                - img [ref=e144]
                - text: Aberto
  - region "Notifications alt+T"
  - alert [ref=e146]
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests — Fluxo completo do usuário
  3   |  * Dashboard → Session → Store → Reservations → Support
  4   |  */
  5   | 
  6   | import { test, expect } from "@playwright/test";
  7   | import { USER_FILE } from "./auth-files";
  8   | 
  9   | test.use({ storageState: USER_FILE });
  10  | 
  11  | test.describe("Fluxo Usuário Completo", () => {
  12  |   test.beforeEach(async ({ page }) => {
  13  |     await page.goto("/dashboard");
  14  |   });
  15  | 
  16  |   test("dashboard carrega com sidebar e KPIs", async ({ page }) => {
  17  |     await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 10000 });
  18  |     await expect(page.getByText(/créditos|minutos/i)).toBeVisible();
  19  |     // Sidebar links
  20  |     await expect(page.getByRole("link", { name: /usar pc/i })).toBeVisible();
  21  |     await expect(page.getByRole("link", { name: /reservas/i })).toBeVisible();
  22  |     await expect(page.getByRole("link", { name: /loja/i })).toBeVisible();
  23  |     await expect(page.getByRole("link", { name: /suporte/i })).toBeVisible();
  24  |   });
  25  | 
  26  |   test("navegação para /session mostra lista de máquinas", async ({ page }) => {
  27  |     await page.goto("/session");
  28  |     await page.waitForLoadState("domcontentloaded");
  29  |     await expect(page.getByRole("heading", { name: /usar.*pc/i })).toBeVisible({ timeout: 10000 });
  30  |     // Pelo menos uma máquina deve aparecer
  31  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  32  |   });
  33  | 
  34  |   test("selecionar máquina habilita botão de gerar PIN", async ({ page }) => {
  35  |     await page.goto("/session");
  36  |     await page.waitForLoadState("domcontentloaded");
  37  |     // Aguarda máquinas carregarem
  38  |     await page.waitForSelector('[data-testid="machine-card"], text=/Wolf|PS5/', { timeout: 15000 });
  39  |     // Clica na primeira máquina disponível
  40  |     const machineCard = page.locator('[data-testid="machine-card"], text=/Wolf|PS5/').first();
  41  |     await machineCard.click();
  42  |     // Botão deve ficar habilitado
  43  |     const btn = page.getByRole("button", { name: /gerar.*pin|usar.*pc/i }).first();
  44  |     await expect(btn).toBeEnabled();
  45  |   });
  46  | 
  47  |   test("página de loja mostra pacotes de crédito", async ({ page }) => {
  48  |     await page.goto("/store");
  49  |     await expect(page.getByRole("heading", { name: /loja|créditos/i })).toBeVisible({ timeout: 10000 });
  50  |     // Pacotes devem estar visíveis
  51  |     await expect(page.getByText(/1 hora|2 horas|corujão|10 horas/i).first()).toBeVisible();
  52  |   });
  53  | 
  54  |   test("solicitar pacote de crédito cria solicitação pendente", async ({ page }) => {
  55  |     await page.goto("/store");
  56  |     await page.waitForLoadState("networkidle");
  57  |     // Clica no primeiro botão de comprar
  58  |     const buyBtn = page.getByRole("button", { name: /comprar|solicitar/i }).first();
  59  |     await buyBtn.click();
  60  |     // Deve mostrar confirmação ou toast
  61  |     await expect(page.getByText(/solicitação|pendente|balcão/i).first()).toBeVisible({ timeout: 5000 });
  62  |   });
  63  | 
  64  |   test("página de reservas mostra formulário", async ({ page }) => {
  65  |     await page.goto("/reservations");
  66  |     await expect(page.getByRole("heading", { name: /reserva/i })).toBeVisible({ timeout: 10000 });
  67  |     await expect(page.getByLabel(/máquina/i)).toBeVisible();
  68  |     await expect(page.getByLabel(/data|quando/i)).toBeVisible();
  69  |     await expect(page.getByLabel(/duração|tempo/i)).toBeVisible();
  70  |   });
  71  | 
  72  |   test("criar reserva com dados válidos", async ({ page }) => {
  73  |     await page.goto("/reservations");
  74  |     await page.waitForLoadState("domcontentloaded");
  75  |     // Preenche formulário
  76  |     await page.selectOption('select[name="machine_id"]', { index: 1 });
  77  |     await page.fill('input[name="start_at"]', new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  78  |     await page.fill('input[name="duration_min"]', "60");
  79  |     await page.getByRole("button", { name: /reservar|confirmar/i }).click();
  80  |     // Sucesso ou erro de créditos (ambos são respostas válidas da API)
  81  |     await expect(page.getByText(/sucesso|reservado|créditos|insuficientes/i).first()).toBeVisible({ timeout: 5000 });
  82  |   });
  83  | 
  84  |   test("página de suporte mostra lista de tickets", async ({ page }) => {
  85  |     await page.goto("/support");
> 86  |     await expect(page.getByRole("heading", { name: /suporte|tickets/i })).toBeVisible({ timeout: 10000 });
      |                                                                           ^ Error: expect(locator).toBeVisible() failed
  87  |     // Botão de novo ticket
  88  |     await expect(page.getByRole("link", { name: /novo ticket|abrir chamado/i })).toBeVisible();
  89  |   });
  90  | 
  91  |   test("criar novo ticket de suporte", async ({ page }) => {
  92  |     await page.goto("/support/new");
  93  |     await expect(page.getByRole("heading", { name: /novo ticket/i })).toBeVisible({ timeout: 10000 });
  94  |     await page.fill('input[name="subject"]', "Problema de teste E2E");
  95  |     await page.fill('textarea[name="body"]', "Este é um ticket de teste automatizado.");
  96  |     await page.getByRole("button", { name: /enviar|criar/i }).click();
  97  |     // Redireciona para detalhes do ticket ou lista
  98  |     await expect(page).toHaveURL(/support/, { timeout: 5000 });
  99  |   });
  100 | 
  101 |   test("perfil do usuário mostra dados pessoais", async ({ page }) => {
  102 |     await page.goto("/profile");
  103 |     await expect(page.getByRole("heading", { name: /perfil|minha conta/i })).toBeVisible({ timeout: 10000 });
  104 |     await expect(page.getByLabel(/nickname|nome/i)).toBeVisible();
  105 |     await expect(page.getByLabel(/email/i)).toBeVisible();
  106 |   });
  107 | });
  108 | 
```
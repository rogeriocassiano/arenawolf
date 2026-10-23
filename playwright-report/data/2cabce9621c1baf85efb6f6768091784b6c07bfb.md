# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-flow.spec.ts >> Fluxo Usuário Completo >> página de reservas mostra formulário
- Location: e2e\user-flow.spec.ts:64:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel(/máquina/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByLabel(/máquina/i)

```

```yaml
- banner:
  - link "Arena Wolf Arena Wolf":
    - /url: /dashboard
    - img "Arena Wolf"
    - text: Arena Wolf
  - text: 2h créditos
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
  - heading "Minhas Reservas" [level=1]
  - paragraph: Histórico e reservas ativas
  - paragraph: Nenhuma reserva ainda
- region "Notifications alt+T"
- alert
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
> 67  |     await expect(page.getByLabel(/máquina/i)).toBeVisible();
      |                                               ^ Error: expect(locator).toBeVisible() failed
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
  86  |     await expect(page.getByRole("heading", { name: /suporte|tickets/i })).toBeVisible({ timeout: 10000 });
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
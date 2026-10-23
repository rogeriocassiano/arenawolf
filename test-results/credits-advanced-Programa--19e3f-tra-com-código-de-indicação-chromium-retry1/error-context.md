# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: credits-advanced.spec.ts >> Programa de Indicação >> novo usuário se cadastra com código de indicação
- Location: e2e\credits-advanced.spec.ts:47:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /criar conta/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /criar conta/i })

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
  - heading "Olá, WolfUser 👋" [level=1]
  - paragraph: Bem-vindo de volta à Arena Wolf
  - text: Créditos
  - paragraph: 2h
  - text: PCs Livres
  - paragraph: 10/10
  - text: PS5 Livres
  - paragraph: 3/3
  - text: Reservas
  - paragraph: "0"
  - heading "Máquinas ao Vivo" [level=2]
  - link "Ver todas":
    - /url: /machines
    - button "Ver todas"
  - paragraph: PS5 01
  - paragraph: PlayStation 5
  - text: Livre
  - paragraph: PS5 02
  - paragraph: PlayStation 5
  - text: Livre
  - paragraph: PS5 03
  - paragraph: PlayStation 5
  - text: Livre
  - paragraph: Wolf 01
  - paragraph: PC Gamer
  - text: Livre
  - paragraph: Wolf 02
  - paragraph: PC Gamer
  - text: Livre
  - paragraph: Wolf 03
  - paragraph: PC Gamer
  - text: Livre
  - heading "Próximas Reservas" [level=3]
  - paragraph: Nenhuma reserva ativa
  - link "Reservar agora":
    - /url: /machines
    - button "Reservar agora"
  - heading "Ações Rápidas" [level=3]
  - link "Reservar máquina":
    - /url: /machines
    - button "Reservar máquina"
  - link "Comprar créditos":
    - /url: /store
    - button "Comprar créditos"
  - link "Ver ranking":
    - /url: /ranking
    - button "Ver ranking"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests — Sistema Avançado de Créditos
  3   |  * Gift Cards, Assinaturas, Indicação, Cashback, Preço Dinâmico
  4   |  */
  5   | 
  6   | import { test, expect } from "@playwright/test";
  7   | import { ADMIN_FILE, USER_FILE } from "./auth-files";
  8   | 
  9   | test.describe("Gift Cards / Códigos Promocionais", () => {
  10  |   test.use({ storageState: USER_FILE });
  11  |   test("usuário resgata código promocional válido", async ({ page }) => {
  12  | 
  13  |     await page.goto("/profile");
  14  |     await page.waitForLoadState("domcontentloaded");
  15  |     
  16  |     // Busca input de código promocional
  17  |     const codeInput = page.locator('input[placeholder*="código"], input[name*="promo"]').first();
  18  |     if (await codeInput.isVisible().catch(() => false)) {
  19  |       await codeInput.fill("WOLF2025");
  20  |       await page.getByRole("button", { name: /resgatar|aplicar/i }).first().click();
  21  |       
  22  |       // Deve mostrar sucesso ou erro (ambos são comportamentos válidos)
  23  |       const toast = page.getByText(/código resgatado|créditos adicionados|código inválido|expirado/i);
  24  |       await expect(toast.first()).toBeVisible({ timeout: 5000 });
  25  |     } else {
  26  |       test.skip(true, "Input de código promocional não encontrado");
  27  |     }
  28  |   });
  29  | });
  30  | 
  31  | test.describe("Programa de Indicação", () => {
  32  |   test.use({ storageState: USER_FILE });
  33  |   test("usuário acessa link de indicação", async ({ page }) => {
  34  | 
  35  |     await page.goto("/profile");
  36  |     await page.waitForLoadState("domcontentloaded");
  37  |     
  38  |     // Busca link de indicação
  39  |     const referralSection = page.locator("text=/indicar|convidar|indicação/i").first();
  40  |     if (await referralSection.isVisible().catch(() => false)) {
  41  |       await expect(page.locator("text=/copiar link|compartilhar/i").first()).toBeVisible();
  42  |     } else {
  43  |       test.skip(true, "Seção de indicação não encontrada");
  44  |     }
  45  |   });
  46  | 
  47  |   test("novo usuário se cadastra com código de indicação", async ({ page }) => {
  48  |     await page.goto("/register?ref=ABC123");
  49  |     await page.waitForLoadState("domcontentloaded");
  50  |     
  51  |     // Formulário de registro deve estar presente
> 52  |     await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  53  |     
  54  |     // O código de indicação deve estar pré-preenchido ou aplicado automaticamente
  55  |     // (isso depende da implementação frontend)
  56  |   });
  57  | });
  58  | 
  59  | test.describe("Cashback na Loja", () => {
  60  |   test.use({ storageState: USER_FILE });
  61  |   test("compra de produto mostra cashback ganho", async ({ page }) => {
  62  | 
  63  |     await page.goto("/store");
  64  |     await page.waitForLoadState("networkidle");
  65  |     
  66  |     // Busca primeiro produto disponível
  67  |     const buyBtn = page.getByRole("button", { name: /comprar/i }).first();
  68  |     if (await buyBtn.isVisible().catch(() => false)) {
  69  |       await buyBtn.click();
  70  |       
  71  |       // Aguarda toast de sucesso
  72  |       const toast = page.getByText(/compra realizada|cashback/i);
  73  |       await expect(toast.first()).toBeVisible({ timeout: 5000 });
  74  |     } else {
  75  |       test.skip(true, "Nenhum produto disponível para compra");
  76  |     }
  77  |   });
  78  | });
  79  | 
  80  | test.describe("Preço Dinâmico", () => {
  81  |   test.use({ storageState: USER_FILE });
  82  |   test("preço muda conforme horário", async ({ page }) => {
  83  | 
  84  |     await page.goto("/session");
  85  |     await page.waitForLoadState("domcontentloaded");
  86  |     
  87  |     // Verifica se há indicador de preço dinâmico
  88  |     const priceIndicator = page.locator("text=/% OFF|promoção|desconto/i").first();
  89  |     // Pode ou não estar visível dependendo do horário
  90  |     if (await priceIndicator.isVisible().catch(() => false)) {
  91  |       expect(await priceIndicator.textContent()).toMatch(/%|OFF/i);
  92  |     }
  93  |   });
  94  | });
  95  | 
  96  | test.describe("Hold em Reservas", () => {
  97  |   test.use({ storageState: USER_FILE });
  98  |   test("criar reserva consome créditos (hold)", async ({ page }) => {
  99  | 
  100 |     await page.goto("/reservations");
  101 |     await page.waitForLoadState("domcontentloaded");
  102 |     
  103 |     // Verifica saldo antes
  104 |     const creditDisplay = page.locator("text=/créditos|minutos/i").first();
  105 |     const beforeText = await creditDisplay.textContent().catch(() => "0");
  106 |     
  107 |     // Preenche formulário
  108 |     const machineSelect = page.locator('select[name="machine_id"]').first();
  109 |     if (await machineSelect.isVisible().catch(() => false)) {
  110 |       await machineSelect.selectOption({ index: 1 });
  111 |       await page.fill('input[name="start_at"]', new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  112 |       await page.fill('input[name="duration_min"]', "60");
  113 |       await page.getByRole("button", { name: /reservar/i }).first().click();
  114 |       
  115 |       // Sucesso ou erro de créditos
  116 |       const toast = page.getByText(/reserva criada|créditos insuficientes/i);
  117 |       await expect(toast.first()).toBeVisible({ timeout: 5000 });
  118 |     } else {
  119 |       test.skip(true, "Formulário de reserva não encontrado");
  120 |     }
  121 |   });
  122 | 
  123 |   test("cancelar reserva devolve créditos", async ({ page }) => {
  124 | 
  125 |     await page.goto("/reservations");
  126 |     await page.waitForLoadState("domcontentloaded");
  127 |     
  128 |     // Busca botão de cancelar em reserva pendente
  129 |     const cancelBtn = page.getByRole("button", { name: /cancelar/i }).first();
  130 |     if (await cancelBtn.isVisible().catch(() => false)) {
  131 |       await cancelBtn.click();
  132 |       
  133 |       // Confirmação ou toast
  134 |       const toast = page.getByText(/cancelada|créditos devolvidos|estorno/i);
  135 |       await expect(toast.first()).toBeVisible({ timeout: 5000 });
  136 |     } else {
  137 |       test.skip(true, "Nenhuma reserva para cancelar");
  138 |     }
  139 |   });
  140 | });
  141 | 
  142 | test.describe("Dashboard de Créditos", () => {
  143 |   test.use({ storageState: USER_FILE });
  144 |   test("visualizar saldo detalhado por tipo", async ({ page }) => {
  145 | 
  146 |     await page.goto("/profile");
  147 |     await page.waitForLoadState("domcontentloaded");
  148 |     
  149 |     // Busca seção de créditos
  150 |     const creditsSection = page.locator("text=/meus créditos|saldo|disponível/i").first();
  151 |     await expect(creditsSection).toBeVisible({ timeout: 10000 });
  152 |     
```
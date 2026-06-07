# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: regression.spec.ts >> Regressão — Bugs corrigidos >> criar e cancelar reserva não afeta outras reservas
- Location: e2e/regression.spec.ts:51:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel(/máquina/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByLabel(/máquina/i)

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
  - heading "Minhas Reservas" [level=1]
  - paragraph: Histórico e reservas ativas
  - paragraph: Nenhuma reserva ainda
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests — Regressão
  3   |  * Testa que bugs corrigidos anteriormente não voltem
  4   |  */
  5   | 
  6   | import { test, expect, Page } from "@playwright/test";
  7   | 
  8   | const TEST_ADMIN = {
  9   |   email: process.env.TEST_ADMIN_EMAIL ?? "luan@arenawolf.com",
  10  |   password: process.env.TEST_ADMIN_PASSWORD ?? "12345678",
  11  | };
  12  | 
  13  | const TEST_USER = {
  14  |   email: process.env.TEST_USER_EMAIL ?? "user@user.com",
  15  |   password: process.env.TEST_USER_PASSWORD ?? "12345678",
  16  | };
  17  | 
  18  | async function loginAsUser(page: Page) {
  19  |   await page.goto("/login");
  20  |   await page.fill('input[type="email"]', TEST_USER.email);
  21  |   await page.fill('input[type="password"]', TEST_USER.password);
  22  |   await page.click('button[type="submit"]');
  23  |   await page.waitForURL("**/dashboard", { timeout: 15000 });
  24  | }
  25  | 
  26  | async function loginAsAdmin(page: Page) {
  27  |   await page.goto("/login");
  28  |   await page.fill('input[type="email"]', TEST_ADMIN.email);
  29  |   await page.fill('input[type="password"]', TEST_ADMIN.password);
  30  |   await page.click('button[type="submit"]');
  31  |   await page.waitForURL(/dashboard|admin/, { timeout: 15000 });
  32  | }
  33  | 
  34  | test.describe("Regressão — Bugs corrigidos", () => {
  35  |   
  36  |   // Bug 1: Inconsistência nos pacotes de crédito (minutes vs total_minutes)
  37  |   test("pacote de crédito mostra minutos corretos na loja", async ({ page }) => {
  38  |     await loginAsUser(page);
  39  |     await page.goto("/store");
  40  |     await page.waitForLoadState("networkidle");
  41  |     
  42  |     // Verifica que os pacotes mostram minutos consistentes
  43  |     const pacote1h = page.locator("text=/1 hora|60 minutos/i").first();
  44  |     const pacote2h = page.locator("text=/2 horas|120 minutos/i").first();
  45  |     
  46  |     await expect(pacote1h).toBeVisible({ timeout: 5000 });
  47  |     await expect(pacote2h).toBeVisible({ timeout: 5000 });
  48  |   });
  49  | 
  50  |   // Bug 2: Rollback cancelava reserva errada (usava id errado)
  51  |   test("criar e cancelar reserva não afeta outras reservas", async ({ page }) => {
  52  |     await loginAsUser(page);
  53  |     await page.goto("/reservations");
  54  |     await page.waitForLoadState("domcontentloaded");
  55  |     
  56  |     // Verifica formulário de reserva está funcional
> 57  |     await expect(page.getByLabel(/máquina/i)).toBeVisible({ timeout: 10000 });
      |                                               ^ Error: expect(locator).toBeVisible() failed
  58  |     
  59  |     // Se houver reservas existentes, verifica que estão com status correto
  60  |     const reservaCards = page.locator("[data-testid='reservation-card'], .reservation-item");
  61  |     const count = await reservaCards.count().catch(() => 0);
  62  |     
  63  |     if (count > 0) {
  64  |       // Verifica que cada reserva tem status único e consistente
  65  |       for (let i = 0; i < Math.min(count, 3); i++) {
  66  |         const status = await reservaCards.nth(i).locator("text=/pendente|confirmada|cancelada/i").isVisible().catch(() => false);
  67  |         expect(status).toBe(true);
  68  |       }
  69  |     }
  70  |   });
  71  | 
  72  |   // Bug 3: Clock skew no ends_at (recalculava no servidor em vez de buscar do banco)
  73  |   test("sessão ativa mostra countdown consistente", async ({ page }) => {
  74  |     await loginAsUser(page);
  75  |     
  76  |     // Se usuário tem sessão ativa, verifica countdown
  77  |     const sessionIndicator = page.locator("text=/minutos restantes|tempo restante/i");
  78  |     if (await sessionIndicator.isVisible().catch(() => false)) {
  79  |       // Aguarda 2 segundos e verifica que countdown diminuiu consistentemente
  80  |       const textBefore = await sessionIndicator.textContent() || "";
  81  |       await page.waitForTimeout(2000);
  82  |       await page.reload();
  83  |       await page.waitForLoadState("networkidle");
  84  |       const textAfter = await sessionIndicator.textContent() || "";
  85  |       
  86  |       // Ambos devem mostrar valores válidos de tempo
  87  |       expect(textBefore).toMatch(/\d+/);
  88  |       expect(textAfter).toMatch(/\d+/);
  89  |     } else {
  90  |       test.skip(true, "Usuário sem sessão ativa");
  91  |     }
  92  |   });
  93  | 
  94  |   // Bug 4: Mensagem confusa sobre pagamento no balcão
  95  |   test("compra de crédito mostra mensagem clara de pagamento no balcão", async ({ page }) => {
  96  |     await loginAsUser(page);
  97  |     await page.goto("/store");
  98  |     await page.waitForLoadState("networkidle");
  99  |     
  100 |     // Clica em comprar
  101 |     const buyBtn = page.getByRole("button", { name: /comprar|solicitar/i }).first();
  102 |     await buyBtn.click();
  103 |     
  104 |     // Verifica mensagem clara sobre balcão
  105 |     const toast = page.getByText(/balcão|operador|confirmação/i);
  106 |     await expect(toast.first()).toBeVisible({ timeout: 5000 });
  107 |   });
  108 | 
  109 |   // Bug 5 & 6: handleAddTime e confirmEndSession sem verificação de erro
  110 |   test("admin: adicionar tempo mostra erro se API falhar", async ({ page }) => {
  111 |     await loginAsAdmin(page);
  112 |     await page.goto("/admin/operator");
  113 |     await page.waitForLoadState("domcontentloaded");
  114 |     
  115 |     // Procura botão de adicionar tempo em máquina ocupada
  116 |     const addTimeBtn = page.getByRole("button", { name: /adicionar tempo/i }).first();
  117 |     if (await addTimeBtn.isVisible().catch(() => false)) {
  118 |       await addTimeBtn.click();
  119 |       // Modal deve abrir
  120 |       await expect(page.getByText(/adicionar tempo|minutos/i)).toBeVisible({ timeout: 3000 });
  121 |       
  122 |       // Tenta adicionar tempo inválido (0 minutos)
  123 |       const minutesInput = page.locator('input[type="number"]').first();
  124 |       if (await minutesInput.isVisible().catch(() => false)) {
  125 |         await minutesInput.fill("0");
  126 |         await page.getByRole("button", { name: /confirmar|adicionar/i }).first().click();
  127 |         // Deve mostrar erro
  128 |         await expect(page.getByText(/erro|inválido|mínimo/i)).toBeVisible({ timeout: 5000 });
  129 |       }
  130 |     } else {
  131 |       test.skip(true, "Nenhuma máquina ocupada para testar");
  132 |     }
  133 |   });
  134 | 
  135 |   // Bug 7: @import CSS fora de ordem no overlay
  136 |   test("overlay do agente carrega CSS corretamente (validação visual indireta)", async () => {
  137 |     // Este teste é mais conceitual - o CSS correto é validado via build
  138 |     // Mas verificamos que o arquivo não tem erros de sintaxe
  139 |     test.skip(true, "Validado via build - CSS @import corrigido");
  140 |   });
  141 | 
  142 |   // Bug 8: window-all-closed encerrava app durante sessão
  143 |   test("app mantém sessão ativa quando overlay está aberto", async () => {
  144 |     // Este é comportamento do Electron - não testável via Playwright web
  145 |     test.skip(true, "Requer teste de integração no agente Electron");
  146 |   });
  147 | });
  148 | 
  149 | test.describe("Regressão — Validações de API", () => {
  150 |   test("API /session/start rejeita minutes > 480", async ({ request }) => {
  151 |     const res = await request.post("/api/session/start", {
  152 |       data: { machine_id: "test", user_id: "test", minutes: 1000 },
  153 |     });
  154 |     expect(res.status()).toBe(401); // Ou 400 se autenticado
  155 |   });
  156 | 
  157 |   test("API /users/add-credits rejeita minutes <= 0", async ({ request }) => {
```
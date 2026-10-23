# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: regression.spec.ts >> Regressão — Validações de API >> API /users/add-credits rejeita minutes <= 0
- Location: e2e\regression.spec.ts:135:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 404
```

# Test source

```ts
  39  |     if (count > 0) {
  40  |       // Verifica que cada reserva tem status único e consistente
  41  |       for (let i = 0; i < Math.min(count, 3); i++) {
  42  |         const status = await reservaCards.nth(i).locator("text=/pendente|confirmada|cancelada/i").isVisible().catch(() => false);
  43  |         expect(status).toBe(true);
  44  |       }
  45  |     }
  46  |   });
  47  | 
  48  |   // Bug 3: Clock skew no ends_at (recalculava no servidor em vez de buscar do banco)
  49  |   test("sessão ativa mostra countdown consistente", async ({ page }) => {
  50  | 
  51  |     
  52  |     // Se usuário tem sessão ativa, verifica countdown
  53  |     const sessionIndicator = page.locator("text=/minutos restantes|tempo restante/i");
  54  |     if (await sessionIndicator.isVisible().catch(() => false)) {
  55  |       // Aguarda 2 segundos e verifica que countdown diminuiu consistentemente
  56  |       const textBefore = await sessionIndicator.textContent() || "";
  57  |       await page.waitForTimeout(2000);
  58  |       await page.reload();
  59  |       await page.waitForLoadState("networkidle");
  60  |       const textAfter = await sessionIndicator.textContent() || "";
  61  |       
  62  |       // Ambos devem mostrar valores válidos de tempo
  63  |       expect(textBefore).toMatch(/\d+/);
  64  |       expect(textAfter).toMatch(/\d+/);
  65  |     } else {
  66  |       test.skip(true, "Usuário sem sessão ativa");
  67  |     }
  68  |   });
  69  | 
  70  |   // Bug 4: Mensagem confusa sobre pagamento no balcão
  71  |   test("compra de crédito mostra mensagem clara de pagamento no balcão", async ({ page }) => {
  72  | 
  73  |     await page.goto("/store");
  74  |     await page.waitForLoadState("networkidle");
  75  |     
  76  |     // Clica em comprar
  77  |     const buyBtn = page.getByRole("button", { name: /comprar|solicitar/i }).first();
  78  |     await buyBtn.click();
  79  |     
  80  |     // Verifica mensagem clara sobre balcão
  81  |     const toast = page.getByText(/balcão|operador|confirmação/i);
  82  |     await expect(toast.first()).toBeVisible({ timeout: 5000 });
  83  |   });
  84  | 
  85  |   // Bug 5 & 6: handleAddTime e confirmEndSession sem verificação de erro
  86  |   test.describe("admin", () => {
  87  |     test.use({ storageState: ADMIN_FILE });
  88  |     test("admin: adicionar tempo mostra erro se API falhar", async ({ page }) => {
  89  |     await page.goto("/admin/operator");
  90  |     await page.waitForLoadState("domcontentloaded");
  91  |     
  92  |     // Procura botão de adicionar tempo em máquina ocupada
  93  |     const addTimeBtn = page.getByRole("button", { name: /adicionar tempo/i }).first();
  94  |     if (await addTimeBtn.isVisible().catch(() => false)) {
  95  |       await addTimeBtn.click();
  96  |       // Modal deve abrir
  97  |       await expect(page.getByText(/adicionar tempo|minutos/i)).toBeVisible({ timeout: 3000 });
  98  |       
  99  |       // Tenta adicionar tempo inválido (0 minutos)
  100 |       const minutesInput = page.locator('input[type="number"]').first();
  101 |       if (await minutesInput.isVisible().catch(() => false)) {
  102 |         await minutesInput.fill("0");
  103 |         await page.getByRole("button", { name: /confirmar|adicionar/i }).first().click();
  104 |         // Deve mostrar erro
  105 |         await expect(page.getByText(/erro|inválido|mínimo/i)).toBeVisible({ timeout: 5000 });
  106 |       }
  107 |     } else {
  108 |       test.skip(true, "Nenhuma máquina ocupada para testar");
  109 |     }
  110 |     });
  111 |   });
  112 | 
  113 |   // Bug 7: @import CSS fora de ordem no overlay
  114 |   test("overlay do agente carrega CSS corretamente (validação visual indireta)", async () => {
  115 |     // Este teste é mais conceitual - o CSS correto é validado via build
  116 |     // Mas verificamos que o arquivo não tem erros de sintaxe
  117 |     test.skip(true, "Validado via build - CSS @import corrigido");
  118 |   });
  119 | 
  120 |   // Bug 8: window-all-closed encerrava app durante sessão
  121 |   test("app mantém sessão ativa quando overlay está aberto", async () => {
  122 |     // Este é comportamento do Electron - não testável via Playwright web
  123 |     test.skip(true, "Requer teste de integração no agente Electron");
  124 |   });
  125 | });
  126 | 
  127 | test.describe("Regressão — Validações de API", () => {
  128 |   test("API /session/start rejeita minutes > 480", async ({ request }) => {
  129 |     const res = await request.post("/api/session/start", {
  130 |       data: { machine_id: "test", user_id: "test", minutes: 1000 },
  131 |     });
  132 |     expect(res.status()).toBe(401); // Ou 400 se autenticado
  133 |   });
  134 | 
  135 |   test("API /users/add-credits rejeita minutes <= 0", async ({ request }) => {
  136 |     const res = await request.post("/api/users/add-credits", {
  137 |       data: { user_id: "test", minutes: 0 },
  138 |     });
> 139 |     expect(res.status()).toBe(401); // Ou 400 se autenticado
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  140 |   });
  141 | 
  142 |   test("API /users/update-role rejeita role inválida", async ({ request }) => {
  143 |     const res = await request.post("/api/users/update-role", {
  144 |       data: { user_id: "test", role: "superadmin" },
  145 |     });
  146 |     expect(res.status()).toBe(401); // Ou 400 se autenticado
  147 |   });
  148 | });
  149 | 
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: regression.spec.ts >> Regressão — Validações de API >> API /users/update-role rejeita role inválida
- Location: e2e/regression.spec.ts:164:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 404
```

# Test source

```ts
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
  158 |     const res = await request.post("/api/users/add-credits", {
  159 |       data: { user_id: "test", minutes: 0 },
  160 |     });
  161 |     expect(res.status()).toBe(401); // Ou 400 se autenticado
  162 |   });
  163 | 
  164 |   test("API /users/update-role rejeita role inválida", async ({ request }) => {
  165 |     const res = await request.post("/api/users/update-role", {
  166 |       data: { user_id: "test", role: "superadmin" },
  167 |     });
> 168 |     expect(res.status()).toBe(401); // Ou 400 se autenticado
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  169 |   });
  170 | });
  171 | 
```
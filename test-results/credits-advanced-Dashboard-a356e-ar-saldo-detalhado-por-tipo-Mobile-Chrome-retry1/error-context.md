# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: credits-advanced.spec.ts >> Dashboard de Créditos >> visualizar saldo detalhado por tipo
- Location: e2e\credits-advanced.spec.ts:144:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/meus créditos|saldo|disponível/i').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=/meus créditos|saldo|disponível/i').first()

```

```yaml
- banner:
  - button "Abrir menu"
  - link "Arena Wolf":
    - /url: /dashboard
    - img "Arena Wolf"
  - text: 2h
  - link "WO":
    - /url: /profile
- complementary:
  - text: WO WolfUser
  - button
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
  - heading "Perfil" [level=1]
  - paragraph: Gerencie sua conta
  - text: WO
  - heading "WolfUser" [level=2]
  - text: user user@user.com Membro desde 20/10/2026 2h de créditos
  - heading "Histórico de Transações" [level=3]
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
  - paragraph: Solicitação de pacote "1h" — 60min (aguardando pagamento no balcão)
  - paragraph: 21/10/2026
  - text: +1h
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  51  |     // Formulário de registro deve estar presente
  52  |     await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
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
> 151 |     await expect(creditsSection).toBeVisible({ timeout: 10000 });
      |                                  ^ Error: expect(locator).toBeVisible() failed
  152 |     
  153 |     // Verifica se há detalhamento por tipo
  154 |     const typeBreakdown = page.locator("text=/pagos|bônus|cashback|expirando/i").first();
  155 |     if (await typeBreakdown.isVisible().catch(() => false)) {
  156 |       expect(await typeBreakdown.textContent()).toBeTruthy();
  157 |     }
  158 |   });
  159 | 
  160 |   test("histórico de transações", async ({ page }) => {
  161 | 
  162 |     await page.goto("/profile");
  163 |     await page.waitForLoadState("domcontentloaded");
  164 |     
  165 |     // Busca aba ou link de histórico
  166 |     const historyLink = page.getByRole("tab", { name: /histórico|transações/i })
  167 |       .or(page.getByRole("link", { name: /histórico|transações/i }))
  168 |       .first();
  169 |     
  170 |     if (await historyLink.isVisible().catch(() => false)) {
  171 |       await historyLink.click();
  172 |       await expect(page.locator("table, list, .transaction").first()).toBeVisible({ timeout: 5000 });
  173 |     } else {
  174 |       test.skip(true, "Link de histórico não encontrado");
  175 |     }
  176 |   });
  177 | });
  178 | 
  179 | test.describe("Admin - Gerenciamento de Créditos", () => {
  180 |   test.use({ storageState: ADMIN_FILE });
  181 | 
  182 |   test("admin cria código promocional", async ({ page }) => {
  183 |     await page.goto("/admin/promocodes");
  184 |     await page.waitForLoadState("domcontentloaded");
  185 |     
  186 |     // Busca botão de criar
  187 |     const createBtn = page.getByRole("button", { name: /novo código|criar/i }).first();
  188 |     if (await createBtn.isVisible().catch(() => false)) {
  189 |       await createBtn.click();
  190 |       
  191 |       // Preenche formulário
  192 |       await page.fill('input[name="code"]', "TEST" + Date.now());
  193 |       await page.fill('input[name="value"]', "60");
  194 |       await page.getByRole("button", { name: /salvar|criar/i }).first().click();
  195 |       
  196 |       const toast = page.getByText(/código criado|sucesso/i);
  197 |       await expect(toast.first()).toBeVisible({ timeout: 5000 });
  198 |     } else {
  199 |       test.skip(true, "Botão de criar código não encontrado");
  200 |     }
  201 |   });
  202 | 
  203 |   test("admin lista regras de preço dinâmico", async ({ page }) => {
  204 |     await page.goto("/admin/pricing");
  205 |     await page.waitForLoadState("domcontentloaded");
  206 |     
  207 |     // Lista de regras deve estar visível
  208 |     const rulesList = page.locator("table, .rule-card, [data-testid='pricing-rule']").first();
  209 |     if (await rulesList.isVisible().catch(() => false)) {
  210 |       await expect(page.getByText(/manhã|noite|domingo|multiplicador/i).first()).toBeVisible();
  211 |     } else {
  212 |       test.skip(true, "Lista de regras de preço não encontrada");
  213 |     }
  214 |   });
  215 | });
  216 | 
```
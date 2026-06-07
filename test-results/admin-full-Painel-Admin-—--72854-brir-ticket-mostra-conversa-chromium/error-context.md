# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full.spec.ts >> Painel Admin — Suporte >> abrir ticket mostra conversa
- Location: e2e/admin-full.spec.ts:192:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('textbox').or(locator('textarea')).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('textbox').or(locator('textarea')).first()

```

```yaml
- complementary:
  - navigation:
    - img "Arena Wolf"
    - paragraph: Arena Wolf
    - paragraph: Admin
    - paragraph: Operacional
    - link "Dashboard":
      - /url: /admin
    - link "Painel Operador":
      - /url: /admin/operator
    - link "Launcher de Apps":
      - /url: /admin/apps
    - link "Máquinas":
      - /url: /admin/machines
    - link "Reservas":
      - /url: /admin/reservations
    - link "Usuários":
      - /url: /admin/users
    - paragraph: Negócio
    - link "Produtos":
      - /url: /admin/products
    - link "Promoções":
      - /url: /admin/marketing/promotions
    - link "Eventos":
      - /url: /admin/events
    - link "Campeonatos":
      - /url: /admin/tournaments
    - link "Financeiro":
      - /url: /admin/financial
    - paragraph: Marketing
    - link "Marketing Hub":
      - /url: /admin/marketing
    - paragraph: Suporte
    - link "Tickets":
      - /url: /admin/support
    - link "Configurações":
      - /url: /admin/settings
    - button "Sair"
- main:
  - heading "Tickets de Suporte" [level=1]
  - paragraph: 0 abertos · 0 em andamento
  - paragraph: "0"
  - paragraph: Abertos
  - paragraph: "0"
  - paragraph: Em andamento
  - paragraph: "0"
  - paragraph: Total
  - paragraph: Nenhum ticket ainda
- region "Notifications alt+T"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  98  |     await loginAsAdmin(page);
  99  |     await page.goto("/admin/users");
  100 |   });
  101 | 
  102 |   test("lista de usuários carrega", async ({ page }) => {
  103 |     await expect(page.getByRole("heading", { name: /usuários|clientes/i })).toBeVisible({ timeout: 10000 });
  104 |     // Tabela ou cards de usuários
  105 |     await expect(page.locator("table, [data-testid='user-card']").first()).toBeVisible({ timeout: 10000 });
  106 |   });
  107 | 
  108 |   test("busca de usuários funciona", async ({ page }) => {
  109 |     const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i);
  110 |     if (await searchInput.isVisible().catch(() => false)) {
  111 |       await searchInput.fill("test");
  112 |       await page.waitForTimeout(500); // debounce
  113 |       // Resultados devem filtrar
  114 |       await expect(page.locator("text=/test|sem resultados/i").first()).toBeVisible({ timeout: 5000 });
  115 |     } else {
  116 |       test.skip(true, "Campo de busca não encontrado");
  117 |     }
  118 |   });
  119 | 
  120 |   test("ações de usuário disponíveis", async ({ page }) => {
  121 |     // Botões de ação na primeira linha
  122 |     const actionsBtn = page.getByRole("button", { name: /ações|menu/i }).first();
  123 |     if (await actionsBtn.isVisible().catch(() => false)) {
  124 |       await actionsBtn.click();
  125 |       await expect(page.getByText(/adicionar créditos|banir|editar/i).first()).toBeVisible({ timeout: 3000 });
  126 |     } else {
  127 |       test.skip(true, "Menu de ações não encontrado");
  128 |     }
  129 |   });
  130 | });
  131 | 
  132 | test.describe("Painel Admin — Apps", () => {
  133 |   test.beforeEach(async ({ page }) => {
  134 |     await loginAsAdmin(page);
  135 |     await page.goto("/admin/apps");
  136 |   });
  137 | 
  138 |   test("catálogo de apps carrega", async ({ page }) => {
  139 |     await expect(page.getByRole("heading", { name: /aplicativos|apps/i })).toBeVisible({ timeout: 10000 });
  140 |     // Tabs ou lista
  141 |     await expect(page.getByRole("tab").or(page.locator("[data-testid='app-card']")).first()).toBeVisible({ timeout: 10000 });
  142 |   });
  143 | 
  144 |   test("aba 'Por Máquina' mostra toggles", async ({ page }) => {
  145 |     const porMaquinaTab = page.getByRole("tab", { name: /por máquina|por pc/i });
  146 |     if (await porMaquinaTab.isVisible().catch(() => false)) {
  147 |       await porMaquinaTab.click();
  148 |       await expect(page.getByRole("switch").or(page.locator("input[type='checkbox']")).first()).toBeVisible({ timeout: 5000 });
  149 |     } else {
  150 |       test.skip(true, "Aba 'Por Máquina' não encontrada");
  151 |     }
  152 |   });
  153 | });
  154 | 
  155 | test.describe("Painel Admin — Financeiro", () => {
  156 |   test.beforeEach(async ({ page }) => {
  157 |     await loginAsAdmin(page);
  158 |     await page.goto("/admin/financial");
  159 |   });
  160 | 
  161 |   test("dashboard financeiro carrega", async ({ page }) => {
  162 |     await expect(page.getByRole("heading", { name: /financeiro|faturamento/i })).toBeVisible({ timeout: 10000 });
  163 |     // KPIs de receita
  164 |     await expect(page.getByText(/receita|vendas|transações/i).first()).toBeVisible({ timeout: 10000 });
  165 |   });
  166 | 
  167 |   test("filtro de período funciona", async ({ page }) => {
  168 |     const dateInput = page.locator("input[type='date']").first();
  169 |     if (await dateInput.isVisible().catch(() => false)) {
  170 |       await dateInput.fill(new Date().toISOString().split("T")[0]);
  171 |       await page.waitForTimeout(500);
  172 |       // Dados devem atualizar
  173 |       await expect(page.locator("text=/R\\$|0,00|carregando/i").first()).toBeVisible({ timeout: 5000 });
  174 |     } else {
  175 |       test.skip(true, "Filtro de data não encontrado");
  176 |     }
  177 |   });
  178 | });
  179 | 
  180 | test.describe("Painel Admin — Suporte", () => {
  181 |   test.beforeEach(async ({ page }) => {
  182 |     await loginAsAdmin(page);
  183 |     await page.goto("/admin/support");
  184 |   });
  185 | 
  186 |   test("lista de tickets carrega", async ({ page }) => {
  187 |     await expect(page.getByRole("heading", { name: /suporte|tickets/i })).toBeVisible({ timeout: 10000 });
  188 |     // Filtros de status
  189 |     await expect(page.getByText(/aberto|fechado|pendente/i).first()).toBeVisible({ timeout: 10000 });
  190 |   });
  191 | 
  192 |   test("abrir ticket mostra conversa", async ({ page }) => {
  193 |     const ticketLink = page.getByRole("link").filter({ hasText: /ticket|chamado/i }).first();
  194 |     if (await ticketLink.isVisible().catch(() => false)) {
  195 |       await ticketLink.click();
  196 |       await expect(page.getByRole("heading", { name: /ticket|assunto/i })).toBeVisible({ timeout: 10000 });
  197 |       // Formulário de resposta
> 198 |       await expect(page.getByRole("textbox").or(page.locator("textarea")).first()).toBeVisible();
      |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  199 |     } else {
  200 |       test.skip(true, "Nenhum ticket disponível");
  201 |     }
  202 |   });
  203 | });
  204 | 
  205 | test.describe("Painel Admin — Configurações", () => {
  206 |   test.beforeEach(async ({ page }) => {
  207 |     await loginAsAdmin(page);
  208 |     await page.goto("/admin/settings");
  209 |   });
  210 | 
  211 |   test("página de configurações carrega", async ({ page }) => {
  212 |     await expect(page.getByRole("heading", { name: /configurações|settings/i })).toBeVisible({ timeout: 10000 });
  213 |   });
  214 | 
  215 |   test("alterar preço por hora", async ({ page }) => {
  216 |     const priceInput = page.locator('input[name*="price"], input[name*="valor"]').first();
  217 |     if (await priceInput.isVisible().catch(() => false)) {
  218 |       await priceInput.fill("15.00");
  219 |       await page.getByRole("button", { name: /salvar|atualizar/i }).first().click();
  220 |       await expect(page.getByText(/salvo|atualizado|sucesso/i)).toBeVisible({ timeout: 5000 });
  221 |     } else {
  222 |       test.skip(true, "Campo de preço não encontrado");
  223 |     }
  224 |   });
  225 | });
  226 | 
```
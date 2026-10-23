# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full.spec.ts >> Painel Admin — Suporte >> abrir ticket mostra conversa
- Location: e2e\admin-full.spec.ts:182:7

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
  - paragraph: 1 aberto · 0 em andamento
  - paragraph: "1"
  - paragraph: Abertos
  - paragraph: "0"
  - paragraph: Em andamento
  - paragraph: "1"
  - paragraph: Total
  - link "Problema de teste E2E WolfUser · 21/10/2026, 04:09 Aberto":
    - /url: /admin/support/489235b8-dd1a-40ce-8e48-9f7022ea1d3e
    - paragraph: Problema de teste E2E
    - paragraph: WolfUser · 21/10/2026, 04:09
    - text: Aberto
- region "Notifications alt+T"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  88  | 
  89  |     await page.goto("/admin/users");
  90  |   });
  91  | 
  92  |   test("lista de usuários carrega", async ({ page }) => {
  93  |     await expect(page.getByRole("heading", { name: /usuários|clientes/i })).toBeVisible({ timeout: 10000 });
  94  |     // Tabela ou cards de usuários
  95  |     await expect(page.locator("table, [data-testid='user-card']").first()).toBeVisible({ timeout: 10000 });
  96  |   });
  97  | 
  98  |   test("busca de usuários funciona", async ({ page }) => {
  99  |     const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i);
  100 |     if (await searchInput.isVisible().catch(() => false)) {
  101 |       await searchInput.fill("test");
  102 |       await page.waitForTimeout(500); // debounce
  103 |       // Resultados devem filtrar
  104 |       await expect(page.locator("text=/test|sem resultados/i").first()).toBeVisible({ timeout: 5000 });
  105 |     } else {
  106 |       test.skip(true, "Campo de busca não encontrado");
  107 |     }
  108 |   });
  109 | 
  110 |   test("ações de usuário disponíveis", async ({ page }) => {
  111 |     // Botões de ação na primeira linha
  112 |     const actionsBtn = page.getByRole("button", { name: /ações|menu/i }).first();
  113 |     if (await actionsBtn.isVisible().catch(() => false)) {
  114 |       await actionsBtn.click();
  115 |       await expect(page.getByText(/adicionar créditos|banir|editar/i).first()).toBeVisible({ timeout: 3000 });
  116 |     } else {
  117 |       test.skip(true, "Menu de ações não encontrado");
  118 |     }
  119 |   });
  120 | });
  121 | 
  122 | test.describe("Painel Admin — Apps", () => {
  123 |   test.beforeEach(async ({ page }) => {
  124 | 
  125 |     await page.goto("/admin/apps");
  126 |   });
  127 | 
  128 |   test("catálogo de apps carrega", async ({ page }) => {
  129 |     await expect(page.getByRole("heading", { name: /aplicativos|apps/i })).toBeVisible({ timeout: 10000 });
  130 |     // Tabs ou lista
  131 |     await expect(page.getByRole("tab").or(page.locator("[data-testid='app-card']")).first()).toBeVisible({ timeout: 10000 });
  132 |   });
  133 | 
  134 |   test("aba 'Por Máquina' mostra toggles", async ({ page }) => {
  135 |     const porMaquinaTab = page.getByRole("tab", { name: /por máquina|por pc/i });
  136 |     if (await porMaquinaTab.isVisible().catch(() => false)) {
  137 |       await porMaquinaTab.click();
  138 |       await expect(page.getByRole("switch").or(page.locator("input[type='checkbox']")).first()).toBeVisible({ timeout: 5000 });
  139 |     } else {
  140 |       test.skip(true, "Aba 'Por Máquina' não encontrada");
  141 |     }
  142 |   });
  143 | });
  144 | 
  145 | test.describe("Painel Admin — Financeiro", () => {
  146 |   test.beforeEach(async ({ page }) => {
  147 | 
  148 |     await page.goto("/admin/financial");
  149 |   });
  150 | 
  151 |   test("dashboard financeiro carrega", async ({ page }) => {
  152 |     await expect(page.getByRole("heading", { name: /financeiro|faturamento/i })).toBeVisible({ timeout: 10000 });
  153 |     // KPIs de receita
  154 |     await expect(page.getByText(/receita|vendas|transações/i).first()).toBeVisible({ timeout: 10000 });
  155 |   });
  156 | 
  157 |   test("filtro de período funciona", async ({ page }) => {
  158 |     const dateInput = page.locator("input[type='date']").first();
  159 |     if (await dateInput.isVisible().catch(() => false)) {
  160 |       await dateInput.fill(new Date().toISOString().split("T")[0]);
  161 |       await page.waitForTimeout(500);
  162 |       // Dados devem atualizar
  163 |       await expect(page.locator("text=/R\\$|0,00|carregando/i").first()).toBeVisible({ timeout: 5000 });
  164 |     } else {
  165 |       test.skip(true, "Filtro de data não encontrado");
  166 |     }
  167 |   });
  168 | });
  169 | 
  170 | test.describe("Painel Admin — Suporte", () => {
  171 |   test.beforeEach(async ({ page }) => {
  172 | 
  173 |     await page.goto("/admin/support");
  174 |   });
  175 | 
  176 |   test("lista de tickets carrega", async ({ page }) => {
  177 |     await expect(page.getByRole("heading", { name: /suporte|tickets/i })).toBeVisible({ timeout: 10000 });
  178 |     // Filtros de status
  179 |     await expect(page.getByText(/aberto|fechado|pendente/i).first()).toBeVisible({ timeout: 10000 });
  180 |   });
  181 | 
  182 |   test("abrir ticket mostra conversa", async ({ page }) => {
  183 |     const ticketLink = page.getByRole("link").filter({ hasText: /ticket|chamado/i }).first();
  184 |     if (await ticketLink.isVisible().catch(() => false)) {
  185 |       await ticketLink.click();
  186 |       await expect(page.getByRole("heading", { name: /ticket|assunto/i })).toBeVisible({ timeout: 10000 });
  187 |       // Formulário de resposta
> 188 |       await expect(page.getByRole("textbox").or(page.locator("textarea")).first()).toBeVisible();
      |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  189 |     } else {
  190 |       test.skip(true, "Nenhum ticket disponível");
  191 |     }
  192 |   });
  193 | });
  194 | 
  195 | test.describe("Painel Admin — Configurações", () => {
  196 |   test.beforeEach(async ({ page }) => {
  197 | 
  198 |     await page.goto("/admin/settings");
  199 |   });
  200 | 
  201 |   test("página de configurações carrega", async ({ page }) => {
  202 |     await expect(page.getByRole("heading", { name: /configurações|settings/i })).toBeVisible({ timeout: 10000 });
  203 |   });
  204 | 
  205 |   test("alterar preço por hora", async ({ page }) => {
  206 |     const priceInput = page.locator('input[name*="price"], input[name*="valor"]').first();
  207 |     if (await priceInput.isVisible().catch(() => false)) {
  208 |       await priceInput.fill("15.00");
  209 |       await page.getByRole("button", { name: /salvar|atualizar/i }).first().click();
  210 |       await expect(page.getByText(/salvo|atualizado|sucesso/i)).toBeVisible({ timeout: 5000 });
  211 |     } else {
  212 |       test.skip(true, "Campo de preço não encontrado");
  213 |     }
  214 |   });
  215 | });
  216 | 
```
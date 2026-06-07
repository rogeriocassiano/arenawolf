# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full.spec.ts >> Painel Admin — Usuários >> busca de usuários funciona
- Location: e2e/admin-full.spec.ts:108:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/test|sem resultados/i').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/test|sem resultados/i').first()

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
  - heading "Usuários" [level=1]
  - paragraph: 2 cadastrados
  - textbox "Buscar por nickname ou email...": test
  - table:
    - rowgroup:
      - row "Usuário Email Role Créditos Último login Ações":
        - columnheader "Usuário"
        - columnheader "Email"
        - columnheader "Role"
        - columnheader "Créditos"
        - columnheader "Último login"
        - columnheader "Ações"
    - rowgroup
  - text: Nenhum usuário encontrado
- region "Notifications alt+T"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  14  |   await page.goto("/login");
  15  |   await page.fill('input[type="email"]', TEST_ADMIN.email);
  16  |   await page.fill('input[type="password"]', TEST_ADMIN.password);
  17  |   await page.click('button[type="submit"]');
  18  |   await page.waitForURL(/dashboard|admin/, { timeout: 15000 });
  19  | }
  20  | 
  21  | test.describe("Painel Admin — Painel Operador", () => {
  22  |   test.beforeEach(async ({ page }) => {
  23  |     await loginAsAdmin(page);
  24  |     await page.goto("/admin/operator");
  25  |   });
  26  | 
  27  |   test("painel operador carrega com grid de máquinas", async ({ page }) => {
  28  |     await expect(page.getByRole("heading", { name: /painel operador/i })).toBeVisible({ timeout: 10000 });
  29  |     // Grid de máquinas
  30  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 20000 });
  31  |   });
  32  | 
  33  |   test("KPIs visíveis no painel operador", async ({ page }) => {
  34  |     await page.waitForLoadState("domcontentloaded");
  35  |     await expect(page.locator("text=/em uso|disponíveis|sessões ativas/i").first()).toBeVisible({ timeout: 10000 });
  36  |   });
  37  | 
  38  |   test("botão Iniciar Sessão abre modal", async ({ page }) => {
  39  |     const startBtn = page.getByRole("button", { name: /iniciar sess/i }).first();
  40  |     await expect(startBtn).toBeVisible({ timeout: 10000 });
  41  |     await startBtn.click();
  42  |     // Modal com formulário
  43  |     await expect(page.getByText(/selecionar usuário|minutos|iniciar/i).nth(1)).toBeVisible({ timeout: 8000 });
  44  |   });
  45  | 
  46  |   test("adicionar tempo em máquina ocupada", async ({ page }) => {
  47  |     // Procura máquina ocupada
  48  |     const machineCard = page.locator("[data-testid='machine-card']").filter({ hasText: /em uso|ocupada/i }).first();
  49  |     if (await machineCard.isVisible().catch(() => false)) {
  50  |       await machineCard.getByRole("button", { name: /adicionar tempo/i }).click();
  51  |       await expect(page.getByText(/adicionar tempo|minutos/i)).toBeVisible({ timeout: 5000 });
  52  |     } else {
  53  |       test.skip(true, "Nenhuma máquina ocupada no momento");
  54  |     }
  55  |   });
  56  | });
  57  | 
  58  | test.describe("Painel Admin — Gerenciamento de Máquinas", () => {
  59  |   test.beforeEach(async ({ page }) => {
  60  |     await loginAsAdmin(page);
  61  |     await page.goto("/admin/machines");
  62  |   });
  63  | 
  64  |   test("lista de máquinas carrega com status", async ({ page }) => {
  65  |     await expect(page.getByRole("heading", { name: /máquinas|pcs/i })).toBeVisible({ timeout: 10000 });
  66  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  67  |   });
  68  | 
  69  |   test("campo MAC address editável", async ({ page }) => {
  70  |     // Primeira máquina PC (não PS5)
  71  |     const macInput = page.locator('input[name*="mac"]').first();
  72  |     await expect(macInput).toBeVisible({ timeout: 10000 });
  73  |     await macInput.fill("AA:BB:CC:DD:EE:FF");
  74  |     await expect(macInput).toHaveValue("AA:BB:CC:DD:EE:FF");
  75  |   });
  76  | 
  77  |   test("botões Ligar/Desligar visíveis para PCs", async ({ page }) => {
  78  |     const ligarBtn = page.getByRole("button", { name: /ligar|wakeup/i }).first();
  79  |     const desligarBtn = page.getByRole("button", { name: /desligar|shutdown/i }).first();
  80  |     // Pelo menos um dos dois deve existir para PCs
  81  |     await expect(ligarBtn.or(desligarBtn)).toBeVisible({ timeout: 10000 });
  82  |   });
  83  | 
  84  |   test("copiar ID da máquina", async ({ page }) => {
  85  |     const copyBtn = page.getByRole("button", { name: /copiar id/i }).first();
  86  |     if (await copyBtn.isVisible().catch(() => false)) {
  87  |       await copyBtn.click();
  88  |       // Toast de sucesso
  89  |       await expect(page.getByText(/copiado|clipboard/i)).toBeVisible({ timeout: 3000 });
  90  |     } else {
  91  |       test.skip(true, "Botão de copiar não encontrado");
  92  |     }
  93  |   });
  94  | });
  95  | 
  96  | test.describe("Painel Admin — Usuários", () => {
  97  |   test.beforeEach(async ({ page }) => {
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
> 114 |       await expect(page.locator("text=/test|sem resultados/i").first()).toBeVisible({ timeout: 5000 });
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
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
  198 |       await expect(page.getByRole("textbox").or(page.locator("textarea")).first()).toBeVisible();
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
```
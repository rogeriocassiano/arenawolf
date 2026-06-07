# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full.spec.ts >> Painel Admin — Gerenciamento de Máquinas >> campo MAC address editável
- Location: e2e/admin-full.spec.ts:69:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name*="mac"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('input[name*="mac"]').first()

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
  - heading "Máquinas" [level=1]
  - paragraph: Gerencie status e configurações das máquinas
  - text: "Wake-on-LAN: Para ligar PCs remotamente, cadastre o MAC address de cada PC e configure o servidor WoL local. O MAC é encontrado no Windows com"
  - code: ipconfig /all
  - text: .
  - heading "PCs Gamer" [level=2]
  - table:
    - rowgroup:
      - row "Máquina ID (UUID) MAC Address Status Preço/h Alterar Status Energia":
        - columnheader "Máquina"
        - columnheader "ID (UUID)"
        - columnheader "MAC Address"
        - columnheader "Status"
        - columnheader "Preço/h"
        - columnheader "Alterar Status"
        - columnheader "Energia"
    - rowgroup:
      - row "Wolf 01 924203e1-7976-474a-9db2-4e35e0379f59 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 01"
        - cell "924203e1-7976-474a-9db2-4e35e0379f59":
          - button "924203e1-7976-474a-9db2-4e35e0379f59"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "Wolf 02 2cb107c9-b272-4d01-bc33-a30a438579fd Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 02"
        - cell "2cb107c9-b272-4d01-bc33-a30a438579fd":
          - button "2cb107c9-b272-4d01-bc33-a30a438579fd"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "Wolf 03 42ef4686-b58e-4fe5-b7b5-a29a4d38d462 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 03"
        - cell "42ef4686-b58e-4fe5-b7b5-a29a4d38d462":
          - button "42ef4686-b58e-4fe5-b7b5-a29a4d38d462"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "Wolf 04 3ff2b4ce-1312-4c0d-9404-6931a044925e Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 04"
        - cell "3ff2b4ce-1312-4c0d-9404-6931a044925e":
          - button "3ff2b4ce-1312-4c0d-9404-6931a044925e"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "Wolf 05 cf041b09-bcde-4de0-a5ce-4f6f60a9f9be Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 05"
        - cell "cf041b09-bcde-4de0-a5ce-4f6f60a9f9be":
          - button "cf041b09-bcde-4de0-a5ce-4f6f60a9f9be"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "Wolf 06 f0999b04-a9d0-4942-b370-c3328ddffb14 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 06"
        - cell "f0999b04-a9d0-4942-b370-c3328ddffb14":
          - button "f0999b04-a9d0-4942-b370-c3328ddffb14"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "Wolf 07 e06feb73-d8e6-4914-befd-9c91a98e4204 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 07"
        - cell "e06feb73-d8e6-4914-befd-9c91a98e4204":
          - button "e06feb73-d8e6-4914-befd-9c91a98e4204"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "Wolf 08 fbf71f8d-9d9c-4c04-a8dd-c88178aa50de Não cadastrado Ocupado R$ 10,00 Ocupado Ligar Desligar":
        - cell "Wolf 08"
        - cell "fbf71f8d-9d9c-4c04-a8dd-c88178aa50de":
          - button "fbf71f8d-9d9c-4c04-a8dd-c88178aa50de"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Ocupado"
        - cell "R$ 10,00"
        - cell "Ocupado":
          - combobox:
            - option "Livre"
            - option "Ocupado" [selected]
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "Wolf 09 3b853f5d-71c2-4d43-b5ff-a2dc0641f387 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 09"
        - cell "3b853f5d-71c2-4d43-b5ff-a2dc0641f387":
          - button "3b853f5d-71c2-4d43-b5ff-a2dc0641f387"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "Wolf 10 17eb8405-dedb-445a-be77-02da4e47bcc8 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 10"
        - cell "17eb8405-dedb-445a-be77-02da4e47bcc8":
          - button "17eb8405-dedb-445a-be77-02da4e47bcc8"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
  - heading "PlayStation 5" [level=2]
  - table:
    - rowgroup:
      - row "Máquina ID (UUID) MAC Address Status Preço/h Alterar Status Energia":
        - columnheader "Máquina"
        - columnheader "ID (UUID)"
        - columnheader "MAC Address"
        - columnheader "Status"
        - columnheader "Preço/h"
        - columnheader "Alterar Status"
        - columnheader "Energia"
    - rowgroup:
      - row "PS5 01 98fd0b46-876d-4d7c-b2de-7af050fc3892 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "PS5 01"
        - cell "98fd0b46-876d-4d7c-b2de-7af050fc3892":
          - button "98fd0b46-876d-4d7c-b2de-7af050fc3892"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "PS5 02 130b63d0-92ae-4dec-8294-99dc82a9207f Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "PS5 02"
        - cell "130b63d0-92ae-4dec-8294-99dc82a9207f":
          - button "130b63d0-92ae-4dec-8294-99dc82a9207f"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
      - row "PS5 03 a71b9d59-a53b-4a36-aa1f-1b2d41780edc Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "PS5 03"
        - cell "a71b9d59-a53b-4a36-aa1f-1b2d41780edc":
          - button "a71b9d59-a53b-4a36-aa1f-1b2d41780edc"
        - cell "Não cadastrado":
          - button "Não cadastrado"
        - cell "Livre"
        - cell "R$ 10,00"
        - cell "Livre":
          - combobox:
            - option "Livre" [selected]
            - option "Ocupado"
            - option "Reservado"
            - option "Manutenção"
        - cell "Ligar Desligar":
          - button "Ligar"
          - button "Desligar"
- region "Notifications alt+T"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests — Painel Admin Completo
  3   |  * Operator, Machines, Users, Apps, Financial, Support, Settings
  4   |  */
  5   | 
  6   | import { test, expect, Page } from "@playwright/test";
  7   | 
  8   | const TEST_ADMIN = {
  9   |   email: process.env.TEST_ADMIN_EMAIL ?? "luan@arenawolf.com",
  10  |   password: process.env.TEST_ADMIN_PASSWORD ?? "12345678",
  11  | };
  12  | 
  13  | async function loginAsAdmin(page: Page) {
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
> 72  |     await expect(macInput).toBeVisible({ timeout: 10000 });
      |                            ^ Error: expect(locator).toBeVisible() failed
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
```
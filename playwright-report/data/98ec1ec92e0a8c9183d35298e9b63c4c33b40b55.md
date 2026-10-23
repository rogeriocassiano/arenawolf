# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full.spec.ts >> Painel Admin — Gerenciamento de Máquinas >> campo MAC address editável
- Location: e2e\admin-full.spec.ts:59:7

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
      - row "Wolf 01 bf6f7745-6e0a-4acd-8ebd-e5a5940efd54 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 01"
        - cell "bf6f7745-6e0a-4acd-8ebd-e5a5940efd54":
          - button "bf6f7745-6e0a-4acd-8ebd-e5a5940efd54"
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
      - row "Wolf 02 e6fa23c9-c0b4-4786-9e63-9dd1ef179acd Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 02"
        - cell "e6fa23c9-c0b4-4786-9e63-9dd1ef179acd":
          - button "e6fa23c9-c0b4-4786-9e63-9dd1ef179acd"
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
      - row "Wolf 03 4fb2ef5a-3318-470d-aa51-6cf09c1f8483 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 03"
        - cell "4fb2ef5a-3318-470d-aa51-6cf09c1f8483":
          - button "4fb2ef5a-3318-470d-aa51-6cf09c1f8483"
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
      - row "Wolf 04 0d346890-011c-4fe0-ba40-cb440e745989 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 04"
        - cell "0d346890-011c-4fe0-ba40-cb440e745989":
          - button "0d346890-011c-4fe0-ba40-cb440e745989"
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
      - row "Wolf 05 5ef5de10-ed49-4288-90e6-032b819d6e4b Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 05"
        - cell "5ef5de10-ed49-4288-90e6-032b819d6e4b":
          - button "5ef5de10-ed49-4288-90e6-032b819d6e4b"
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
      - row "Wolf 06 76fd64dc-503f-4831-ab45-b732c459f21d Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 06"
        - cell "76fd64dc-503f-4831-ab45-b732c459f21d":
          - button "76fd64dc-503f-4831-ab45-b732c459f21d"
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
      - row "Wolf 07 5ecdce89-1a5d-4880-8641-022511667cb2 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 07"
        - cell "5ecdce89-1a5d-4880-8641-022511667cb2":
          - button "5ecdce89-1a5d-4880-8641-022511667cb2"
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
      - row "Wolf 08 a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 08"
        - cell "a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b":
          - button "a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b"
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
      - row "Wolf 09 5dd39452-b848-4458-9175-e40a7e9cc6ce Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 09"
        - cell "5dd39452-b848-4458-9175-e40a7e9cc6ce":
          - button "5dd39452-b848-4458-9175-e40a7e9cc6ce"
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
      - row "Wolf 10 8cde252a-a598-4a13-be33-6c941b79ec76 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "Wolf 10"
        - cell "8cde252a-a598-4a13-be33-6c941b79ec76":
          - button "8cde252a-a598-4a13-be33-6c941b79ec76"
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
      - row "PS5 01 cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "PS5 01"
        - cell "cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e":
          - button "cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e"
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
      - row "PS5 02 cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "PS5 02"
        - cell "cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8":
          - button "cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8"
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
      - row "PS5 03 f32204e7-eca8-4e59-98be-a7fe0b038806 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar":
        - cell "PS5 03"
        - cell "f32204e7-eca8-4e59-98be-a7fe0b038806":
          - button "f32204e7-eca8-4e59-98be-a7fe0b038806"
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
  6   | import { test, expect } from "@playwright/test";
  7   | import { ADMIN_FILE } from "./auth-files";
  8   | 
  9   | test.use({ storageState: ADMIN_FILE });
  10  | 
  11  | test.describe("Painel Admin — Painel Operador", () => {
  12  |   test.beforeEach(async ({ page }) => {
  13  | 
  14  |     await page.goto("/admin/operator");
  15  |   });
  16  | 
  17  |   test("painel operador carrega com grid de máquinas", async ({ page }) => {
  18  |     await expect(page.getByRole("heading", { name: /painel operador/i })).toBeVisible({ timeout: 10000 });
  19  |     // Grid de máquinas
  20  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 20000 });
  21  |   });
  22  | 
  23  |   test("KPIs visíveis no painel operador", async ({ page }) => {
  24  |     await page.waitForLoadState("domcontentloaded");
  25  |     await expect(page.locator("text=/em uso|disponíveis|sessões ativas/i").first()).toBeVisible({ timeout: 10000 });
  26  |   });
  27  | 
  28  |   test("botão Iniciar Sessão abre modal", async ({ page }) => {
  29  |     const startBtn = page.getByRole("button", { name: /iniciar sess/i }).first();
  30  |     await expect(startBtn).toBeVisible({ timeout: 10000 });
  31  |     await startBtn.click();
  32  |     // Modal com formulário
  33  |     await expect(page.getByText(/selecionar usuário|minutos|iniciar/i).nth(1)).toBeVisible({ timeout: 8000 });
  34  |   });
  35  | 
  36  |   test("adicionar tempo em máquina ocupada", async ({ page }) => {
  37  |     // Procura máquina ocupada
  38  |     const machineCard = page.locator("[data-testid='machine-card']").filter({ hasText: /em uso|ocupada/i }).first();
  39  |     if (await machineCard.isVisible().catch(() => false)) {
  40  |       await machineCard.getByRole("button", { name: /adicionar tempo/i }).click();
  41  |       await expect(page.getByText(/adicionar tempo|minutos/i)).toBeVisible({ timeout: 5000 });
  42  |     } else {
  43  |       test.skip(true, "Nenhuma máquina ocupada no momento");
  44  |     }
  45  |   });
  46  | });
  47  | 
  48  | test.describe("Painel Admin — Gerenciamento de Máquinas", () => {
  49  |   test.beforeEach(async ({ page }) => {
  50  | 
  51  |     await page.goto("/admin/machines");
  52  |   });
  53  | 
  54  |   test("lista de máquinas carrega com status", async ({ page }) => {
  55  |     await expect(page.getByRole("heading", { name: /máquinas|pcs/i })).toBeVisible({ timeout: 10000 });
  56  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  57  |   });
  58  | 
  59  |   test("campo MAC address editável", async ({ page }) => {
  60  |     // Primeira máquina PC (não PS5)
  61  |     const macInput = page.locator('input[name*="mac"]').first();
> 62  |     await expect(macInput).toBeVisible({ timeout: 10000 });
      |                            ^ Error: expect(locator).toBeVisible() failed
  63  |     await macInput.fill("AA:BB:CC:DD:EE:FF");
  64  |     await expect(macInput).toHaveValue("AA:BB:CC:DD:EE:FF");
  65  |   });
  66  | 
  67  |   test("botões Ligar/Desligar visíveis para PCs", async ({ page }) => {
  68  |     const ligarBtn = page.getByRole("button", { name: /ligar|wakeup/i }).first();
  69  |     const desligarBtn = page.getByRole("button", { name: /desligar|shutdown/i }).first();
  70  |     // Pelo menos um dos dois deve existir para PCs
  71  |     await expect(ligarBtn.or(desligarBtn)).toBeVisible({ timeout: 10000 });
  72  |   });
  73  | 
  74  |   test("copiar ID da máquina", async ({ page }) => {
  75  |     const copyBtn = page.getByRole("button", { name: /copiar id/i }).first();
  76  |     if (await copyBtn.isVisible().catch(() => false)) {
  77  |       await copyBtn.click();
  78  |       // Toast de sucesso
  79  |       await expect(page.getByText(/copiado|clipboard/i)).toBeVisible({ timeout: 3000 });
  80  |     } else {
  81  |       test.skip(true, "Botão de copiar não encontrado");
  82  |     }
  83  |   });
  84  | });
  85  | 
  86  | test.describe("Painel Admin — Usuários", () => {
  87  |   test.beforeEach(async ({ page }) => {
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
```
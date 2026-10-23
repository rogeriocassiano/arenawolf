# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-flow.spec.ts >> Fluxo Usuário Completo >> selecionar máquina habilita botão de gerar PIN
- Location: e2e\user-flow.spec.ts:34:7

# Error details

```
Error: page.waitForSelector: Unexpected token "=" while parsing css selector "[data-testid="machine-card"], text=/Wolf|PS5/". Did you mean to CSS.escape it?
Call log:
  - waiting for [data-testid="machine-card"], text=/Wolf|PS5/ to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - button "Abrir menu" [ref=e4]:
        - img [ref=e5]
      - link "Arena Wolf" [ref=e6] [cursor=pointer]:
        - /url: /dashboard
        - img "Arena Wolf" [ref=e7]
      - generic [ref=e8]:
        - img [ref=e9]
        - generic [ref=e12]: 2h
      - link "WO" [ref=e13] [cursor=pointer]:
        - /url: /profile
        - generic [ref=e15]: WO
    - complementary [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e20]: WO
          - generic [ref=e21]: WolfUser
        - button [ref=e22]:
          - img [ref=e23]
      - navigation [ref=e27]:
        - link "Dashboard" [ref=e28] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e29]
          - generic [ref=e34]: Dashboard
        - link "Usar PC" [ref=e35] [cursor=pointer]:
          - /url: /session
          - img [ref=e36]
          - generic [ref=e38]: Usar PC
        - link "Máquinas" [ref=e40] [cursor=pointer]:
          - /url: /machines
          - img [ref=e41]
          - generic [ref=e43]: Máquinas
        - link "Reservas" [ref=e44] [cursor=pointer]:
          - /url: /reservations
          - img [ref=e45]
          - generic [ref=e49]: Reservas
        - link "Loja" [ref=e50] [cursor=pointer]:
          - /url: /store
          - img [ref=e51]
          - generic [ref=e54]: Loja
        - link "Eventos" [ref=e55] [cursor=pointer]:
          - /url: /events
          - img [ref=e56]
          - generic [ref=e61]: Eventos
        - link "Promoções" [ref=e62] [cursor=pointer]:
          - /url: /promotions
          - img [ref=e63]
          - generic [ref=e66]: Promoções
        - link "Ranking" [ref=e67] [cursor=pointer]:
          - /url: /ranking
          - img [ref=e68]
          - generic [ref=e74]: Ranking
        - link "Suporte" [ref=e75] [cursor=pointer]:
          - /url: /support
          - img [ref=e76]
          - generic [ref=e78]: Suporte
        - link "Perfil" [ref=e79] [cursor=pointer]:
          - /url: /profile
          - img [ref=e80]
          - generic [ref=e83]: Perfil
        - button "Sair" [ref=e87]:
          - img [ref=e88]
          - generic [ref=e91]: Sair
    - main [ref=e93]:
      - generic [ref=e94]:
        - generic [ref=e95]:
          - heading "Usar um PC" [level=1] [ref=e96]:
            - img [ref=e97]
            - text: Usar um PC
          - paragraph [ref=e99]: Selecione uma máquina, gere seu PIN e insira no PC para começar.
        - generic [ref=e100]:
          - img [ref=e101]
          - generic [ref=e104]:
            - paragraph [ref=e105]: Seu saldo
            - paragraph [ref=e106]: 2h
        - generic [ref=e107]:
          - heading "Selecione uma máquina(13 disponíveis)" [level=2] [ref=e108]:
            - text: Selecione uma máquina
            - generic [ref=e109]: (13 disponíveis)
          - generic [ref=e110]:
            - button "PS5 01 Disponível" [ref=e111]:
              - generic [ref=e112]:
                - img [ref=e113]
                - generic [ref=e115]: PS5 01
              - generic [ref=e116]: Disponível
            - button "PS5 02 Disponível" [ref=e117]:
              - generic [ref=e118]:
                - img [ref=e119]
                - generic [ref=e121]: PS5 02
              - generic [ref=e122]: Disponível
            - button "PS5 03 Disponível" [ref=e123]:
              - generic [ref=e124]:
                - img [ref=e125]
                - generic [ref=e127]: PS5 03
              - generic [ref=e128]: Disponível
            - button "Wolf 01 Disponível" [ref=e129]:
              - generic [ref=e130]:
                - img [ref=e131]
                - generic [ref=e133]: Wolf 01
              - generic [ref=e134]: Disponível
            - button "Wolf 02 Disponível" [ref=e135]:
              - generic [ref=e136]:
                - img [ref=e137]
                - generic [ref=e139]: Wolf 02
              - generic [ref=e140]: Disponível
            - button "Wolf 03 Disponível" [ref=e141]:
              - generic [ref=e142]:
                - img [ref=e143]
                - generic [ref=e145]: Wolf 03
              - generic [ref=e146]: Disponível
            - button "Wolf 04 Disponível" [ref=e147]:
              - generic [ref=e148]:
                - img [ref=e149]
                - generic [ref=e151]: Wolf 04
              - generic [ref=e152]: Disponível
            - button "Wolf 05 Disponível" [ref=e153]:
              - generic [ref=e154]:
                - img [ref=e155]
                - generic [ref=e157]: Wolf 05
              - generic [ref=e158]: Disponível
            - button "Wolf 06 Disponível" [ref=e159]:
              - generic [ref=e160]:
                - img [ref=e161]
                - generic [ref=e163]: Wolf 06
              - generic [ref=e164]: Disponível
            - button "Wolf 07 Disponível" [ref=e165]:
              - generic [ref=e166]:
                - img [ref=e167]
                - generic [ref=e169]: Wolf 07
              - generic [ref=e170]: Disponível
            - button "Wolf 08 Disponível" [ref=e171]:
              - generic [ref=e172]:
                - img [ref=e173]
                - generic [ref=e175]: Wolf 08
              - generic [ref=e176]: Disponível
            - button "Wolf 09 Disponível" [ref=e177]:
              - generic [ref=e178]:
                - img [ref=e179]
                - generic [ref=e181]: Wolf 09
              - generic [ref=e182]: Disponível
            - button "Wolf 10 Disponível" [ref=e183]:
              - generic [ref=e184]:
                - img [ref=e185]
                - generic [ref=e187]: Wolf 10
              - generic [ref=e188]: Disponível
        - button "Gerar PIN para o PC" [disabled]:
          - img
          - text: Gerar PIN para o PC
        - generic [ref=e189]:
          - paragraph [ref=e190]: Como funciona
          - generic [ref=e191]:
            - generic [ref=e192]: "1"
            - paragraph [ref=e193]: Selecione uma máquina disponível
          - generic [ref=e194]:
            - generic [ref=e195]: "2"
            - paragraph [ref=e196]: Clique em "Gerar PIN" — um código de 6 dígitos aparece
          - generic [ref=e197]:
            - generic [ref=e198]: "3"
            - paragraph [ref=e199]: Vá até o PC e insira o PIN na tela de bloqueio
          - generic [ref=e200]:
            - generic [ref=e201]: "4"
            - paragraph [ref=e202]: Sua sessão inicia e o tempo começa a contar
          - generic [ref=e203]:
            - generic [ref=e204]: "5"
            - paragraph [ref=e205]: Ao encerrar (ou quando o tempo acabar), o PC bloqueia automaticamente
  - region "Notifications alt+T"
  - alert [ref=e206]
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests — Fluxo completo do usuário
  3   |  * Dashboard → Session → Store → Reservations → Support
  4   |  */
  5   | 
  6   | import { test, expect } from "@playwright/test";
  7   | import { USER_FILE } from "./auth-files";
  8   | 
  9   | test.use({ storageState: USER_FILE });
  10  | 
  11  | test.describe("Fluxo Usuário Completo", () => {
  12  |   test.beforeEach(async ({ page }) => {
  13  |     await page.goto("/dashboard");
  14  |   });
  15  | 
  16  |   test("dashboard carrega com sidebar e KPIs", async ({ page }) => {
  17  |     await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 10000 });
  18  |     await expect(page.getByText(/créditos|minutos/i)).toBeVisible();
  19  |     // Sidebar links
  20  |     await expect(page.getByRole("link", { name: /usar pc/i })).toBeVisible();
  21  |     await expect(page.getByRole("link", { name: /reservas/i })).toBeVisible();
  22  |     await expect(page.getByRole("link", { name: /loja/i })).toBeVisible();
  23  |     await expect(page.getByRole("link", { name: /suporte/i })).toBeVisible();
  24  |   });
  25  | 
  26  |   test("navegação para /session mostra lista de máquinas", async ({ page }) => {
  27  |     await page.goto("/session");
  28  |     await page.waitForLoadState("domcontentloaded");
  29  |     await expect(page.getByRole("heading", { name: /usar.*pc/i })).toBeVisible({ timeout: 10000 });
  30  |     // Pelo menos uma máquina deve aparecer
  31  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  32  |   });
  33  | 
  34  |   test("selecionar máquina habilita botão de gerar PIN", async ({ page }) => {
  35  |     await page.goto("/session");
  36  |     await page.waitForLoadState("domcontentloaded");
  37  |     // Aguarda máquinas carregarem
> 38  |     await page.waitForSelector('[data-testid="machine-card"], text=/Wolf|PS5/', { timeout: 15000 });
      |                ^ Error: page.waitForSelector: Unexpected token "=" while parsing css selector "[data-testid="machine-card"], text=/Wolf|PS5/". Did you mean to CSS.escape it?
  39  |     // Clica na primeira máquina disponível
  40  |     const machineCard = page.locator('[data-testid="machine-card"], text=/Wolf|PS5/').first();
  41  |     await machineCard.click();
  42  |     // Botão deve ficar habilitado
  43  |     const btn = page.getByRole("button", { name: /gerar.*pin|usar.*pc/i }).first();
  44  |     await expect(btn).toBeEnabled();
  45  |   });
  46  | 
  47  |   test("página de loja mostra pacotes de crédito", async ({ page }) => {
  48  |     await page.goto("/store");
  49  |     await expect(page.getByRole("heading", { name: /loja|créditos/i })).toBeVisible({ timeout: 10000 });
  50  |     // Pacotes devem estar visíveis
  51  |     await expect(page.getByText(/1 hora|2 horas|corujão|10 horas/i).first()).toBeVisible();
  52  |   });
  53  | 
  54  |   test("solicitar pacote de crédito cria solicitação pendente", async ({ page }) => {
  55  |     await page.goto("/store");
  56  |     await page.waitForLoadState("networkidle");
  57  |     // Clica no primeiro botão de comprar
  58  |     const buyBtn = page.getByRole("button", { name: /comprar|solicitar/i }).first();
  59  |     await buyBtn.click();
  60  |     // Deve mostrar confirmação ou toast
  61  |     await expect(page.getByText(/solicitação|pendente|balcão/i).first()).toBeVisible({ timeout: 5000 });
  62  |   });
  63  | 
  64  |   test("página de reservas mostra formulário", async ({ page }) => {
  65  |     await page.goto("/reservations");
  66  |     await expect(page.getByRole("heading", { name: /reserva/i })).toBeVisible({ timeout: 10000 });
  67  |     await expect(page.getByLabel(/máquina/i)).toBeVisible();
  68  |     await expect(page.getByLabel(/data|quando/i)).toBeVisible();
  69  |     await expect(page.getByLabel(/duração|tempo/i)).toBeVisible();
  70  |   });
  71  | 
  72  |   test("criar reserva com dados válidos", async ({ page }) => {
  73  |     await page.goto("/reservations");
  74  |     await page.waitForLoadState("domcontentloaded");
  75  |     // Preenche formulário
  76  |     await page.selectOption('select[name="machine_id"]', { index: 1 });
  77  |     await page.fill('input[name="start_at"]', new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  78  |     await page.fill('input[name="duration_min"]', "60");
  79  |     await page.getByRole("button", { name: /reservar|confirmar/i }).click();
  80  |     // Sucesso ou erro de créditos (ambos são respostas válidas da API)
  81  |     await expect(page.getByText(/sucesso|reservado|créditos|insuficientes/i).first()).toBeVisible({ timeout: 5000 });
  82  |   });
  83  | 
  84  |   test("página de suporte mostra lista de tickets", async ({ page }) => {
  85  |     await page.goto("/support");
  86  |     await expect(page.getByRole("heading", { name: /suporte|tickets/i })).toBeVisible({ timeout: 10000 });
  87  |     // Botão de novo ticket
  88  |     await expect(page.getByRole("link", { name: /novo ticket|abrir chamado/i })).toBeVisible();
  89  |   });
  90  | 
  91  |   test("criar novo ticket de suporte", async ({ page }) => {
  92  |     await page.goto("/support/new");
  93  |     await expect(page.getByRole("heading", { name: /novo ticket/i })).toBeVisible({ timeout: 10000 });
  94  |     await page.fill('input[name="subject"]', "Problema de teste E2E");
  95  |     await page.fill('textarea[name="body"]', "Este é um ticket de teste automatizado.");
  96  |     await page.getByRole("button", { name: /enviar|criar/i }).click();
  97  |     // Redireciona para detalhes do ticket ou lista
  98  |     await expect(page).toHaveURL(/support/, { timeout: 5000 });
  99  |   });
  100 | 
  101 |   test("perfil do usuário mostra dados pessoais", async ({ page }) => {
  102 |     await page.goto("/profile");
  103 |     await expect(page.getByRole("heading", { name: /perfil|minha conta/i })).toBeVisible({ timeout: 10000 });
  104 |     await expect(page.getByLabel(/nickname|nome/i)).toBeVisible();
  105 |     await expect(page.getByLabel(/email/i)).toBeVisible();
  106 |   });
  107 | });
  108 | 
```
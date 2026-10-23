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
      - link "Arena Wolf Arena Wolf" [ref=e4] [cursor=pointer]:
        - /url: /dashboard
        - img "Arena Wolf" [ref=e5]
        - generic [ref=e6]: Arena Wolf
      - generic [ref=e7]:
        - img [ref=e8]
        - generic [ref=e11]: 2h
        - generic [ref=e12]: créditos
      - link "WO" [ref=e13] [cursor=pointer]:
        - /url: /profile
        - generic [ref=e15]: WO
    - generic [ref=e16]:
      - complementary [ref=e17]:
        - navigation [ref=e18]:
          - link "Dashboard" [ref=e19] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e20]
            - generic [ref=e25]: Dashboard
          - link "Usar PC" [ref=e26] [cursor=pointer]:
            - /url: /session
            - img [ref=e27]
            - generic [ref=e29]: Usar PC
          - link "Máquinas" [ref=e31] [cursor=pointer]:
            - /url: /machines
            - img [ref=e32]
            - generic [ref=e34]: Máquinas
          - link "Reservas" [ref=e35] [cursor=pointer]:
            - /url: /reservations
            - img [ref=e36]
            - generic [ref=e40]: Reservas
          - link "Loja" [ref=e41] [cursor=pointer]:
            - /url: /store
            - img [ref=e42]
            - generic [ref=e45]: Loja
          - link "Eventos" [ref=e46] [cursor=pointer]:
            - /url: /events
            - img [ref=e47]
            - generic [ref=e52]: Eventos
          - link "Promoções" [ref=e53] [cursor=pointer]:
            - /url: /promotions
            - img [ref=e54]
            - generic [ref=e57]: Promoções
          - link "Ranking" [ref=e58] [cursor=pointer]:
            - /url: /ranking
            - img [ref=e59]
            - generic [ref=e65]: Ranking
          - link "Suporte" [ref=e66] [cursor=pointer]:
            - /url: /support
            - img [ref=e67]
            - generic [ref=e69]: Suporte
          - link "Perfil" [ref=e70] [cursor=pointer]:
            - /url: /profile
            - img [ref=e71]
            - generic [ref=e74]: Perfil
          - button "Sair" [ref=e78]:
            - img [ref=e79]
            - generic [ref=e82]: Sair
      - main [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]:
            - heading "Usar um PC" [level=1] [ref=e86]:
              - img [ref=e87]
              - text: Usar um PC
            - paragraph [ref=e89]: Selecione uma máquina, gere seu PIN e insira no PC para começar.
          - generic [ref=e90]:
            - img [ref=e91]
            - generic [ref=e94]:
              - paragraph [ref=e95]: Seu saldo
              - paragraph [ref=e96]: 2h
          - generic [ref=e97]:
            - heading "Selecione uma máquina(13 disponíveis)" [level=2] [ref=e98]:
              - text: Selecione uma máquina
              - generic [ref=e99]: (13 disponíveis)
            - generic [ref=e100]:
              - button "PS5 01 Disponível" [ref=e101]:
                - generic [ref=e102]:
                  - img [ref=e103]
                  - generic [ref=e105]: PS5 01
                - generic [ref=e106]: Disponível
              - button "PS5 02 Disponível" [ref=e107]:
                - generic [ref=e108]:
                  - img [ref=e109]
                  - generic [ref=e111]: PS5 02
                - generic [ref=e112]: Disponível
              - button "PS5 03 Disponível" [ref=e113]:
                - generic [ref=e114]:
                  - img [ref=e115]
                  - generic [ref=e117]: PS5 03
                - generic [ref=e118]: Disponível
              - button "Wolf 01 Disponível" [ref=e119]:
                - generic [ref=e120]:
                  - img [ref=e121]
                  - generic [ref=e123]: Wolf 01
                - generic [ref=e124]: Disponível
              - button "Wolf 02 Disponível" [ref=e125]:
                - generic [ref=e126]:
                  - img [ref=e127]
                  - generic [ref=e129]: Wolf 02
                - generic [ref=e130]: Disponível
              - button "Wolf 03 Disponível" [ref=e131]:
                - generic [ref=e132]:
                  - img [ref=e133]
                  - generic [ref=e135]: Wolf 03
                - generic [ref=e136]: Disponível
              - button "Wolf 04 Disponível" [ref=e137]:
                - generic [ref=e138]:
                  - img [ref=e139]
                  - generic [ref=e141]: Wolf 04
                - generic [ref=e142]: Disponível
              - button "Wolf 05 Disponível" [ref=e143]:
                - generic [ref=e144]:
                  - img [ref=e145]
                  - generic [ref=e147]: Wolf 05
                - generic [ref=e148]: Disponível
              - button "Wolf 06 Disponível" [ref=e149]:
                - generic [ref=e150]:
                  - img [ref=e151]
                  - generic [ref=e153]: Wolf 06
                - generic [ref=e154]: Disponível
              - button "Wolf 07 Disponível" [ref=e155]:
                - generic [ref=e156]:
                  - img [ref=e157]
                  - generic [ref=e159]: Wolf 07
                - generic [ref=e160]: Disponível
              - button "Wolf 08 Disponível" [ref=e161]:
                - generic [ref=e162]:
                  - img [ref=e163]
                  - generic [ref=e165]: Wolf 08
                - generic [ref=e166]: Disponível
              - button "Wolf 09 Disponível" [ref=e167]:
                - generic [ref=e168]:
                  - img [ref=e169]
                  - generic [ref=e171]: Wolf 09
                - generic [ref=e172]: Disponível
              - button "Wolf 10 Disponível" [ref=e173]:
                - generic [ref=e174]:
                  - img [ref=e175]
                  - generic [ref=e177]: Wolf 10
                - generic [ref=e178]: Disponível
          - button "Gerar PIN para o PC" [disabled]:
            - img
            - text: Gerar PIN para o PC
          - generic [ref=e179]:
            - paragraph [ref=e180]: Como funciona
            - generic [ref=e181]:
              - generic [ref=e182]: "1"
              - paragraph [ref=e183]: Selecione uma máquina disponível
            - generic [ref=e184]:
              - generic [ref=e185]: "2"
              - paragraph [ref=e186]: Clique em "Gerar PIN" — um código de 6 dígitos aparece
            - generic [ref=e187]:
              - generic [ref=e188]: "3"
              - paragraph [ref=e189]: Vá até o PC e insira o PIN na tela de bloqueio
            - generic [ref=e190]:
              - generic [ref=e191]: "4"
              - paragraph [ref=e192]: Sua sessão inicia e o tempo começa a contar
            - generic [ref=e193]:
              - generic [ref=e194]: "5"
              - paragraph [ref=e195]: Ao encerrar (ou quando o tempo acabar), o PC bloqueia automaticamente
  - region "Notifications alt+T"
  - alert [ref=e196]
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
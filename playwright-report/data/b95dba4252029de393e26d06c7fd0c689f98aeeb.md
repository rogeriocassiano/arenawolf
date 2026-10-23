# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navegação via Sidebar — usuário >> usuário navega pelo menu lateral
- Location: e2e\navigation.spec.ts:132:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('nav a[href="/session"]:visible').first()
    - locator resolved to <a href="/session" class="flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all duration-200 group text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
      - waiting 100ms
    227 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - element is outside of the viewport
      - retrying click action
        - waiting 500ms

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
        - link "Usar PC" [ref=e36] [cursor=pointer]:
          - /url: /session
          - img [ref=e37]
          - generic [ref=e39]: Usar PC
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
          - heading "Olá, WolfUser 👋" [level=1] [ref=e96]
          - paragraph [ref=e97]: Bem-vindo de volta à Arena Wolf
        - generic [ref=e98]:
          - generic [ref=e100]:
            - generic [ref=e101]:
              - generic [ref=e102]: Créditos
              - img [ref=e103]
            - paragraph [ref=e106]: 2h
          - generic [ref=e108]:
            - generic [ref=e109]:
              - generic [ref=e110]: PCs Livres
              - img [ref=e111]
            - paragraph [ref=e113]:
              - text: "10"
              - generic [ref=e114]: /10
          - generic [ref=e116]:
            - generic [ref=e117]:
              - generic [ref=e118]: PS5 Livres
              - img [ref=e119]
            - paragraph [ref=e121]:
              - text: "3"
              - generic [ref=e122]: /3
          - generic [ref=e124]:
            - generic [ref=e125]:
              - generic [ref=e126]: Reservas
              - img [ref=e127]
            - paragraph [ref=e131]: "0"
        - generic [ref=e132]:
          - generic [ref=e133]:
            - generic [ref=e134]:
              - heading "Máquinas ao Vivo" [level=2] [ref=e135]
              - link "Ver todas" [ref=e136] [cursor=pointer]:
                - /url: /machines
                - button "Ver todas" [ref=e137]:
                  - text: Ver todas
                  - img [ref=e138]
            - generic [ref=e140]:
              - generic [ref=e142] [cursor=pointer]:
                - generic [ref=e143]:
                  - img [ref=e145]
                  - generic [ref=e147]:
                    - paragraph [ref=e148]: PS5 01
                    - paragraph [ref=e149]: PlayStation 5
                - generic [ref=e150]: Livre
              - generic [ref=e153] [cursor=pointer]:
                - generic [ref=e154]:
                  - img [ref=e156]
                  - generic [ref=e158]:
                    - paragraph [ref=e159]: PS5 02
                    - paragraph [ref=e160]: PlayStation 5
                - generic [ref=e161]: Livre
              - generic [ref=e164] [cursor=pointer]:
                - generic [ref=e165]:
                  - img [ref=e167]
                  - generic [ref=e169]:
                    - paragraph [ref=e170]: PS5 03
                    - paragraph [ref=e171]: PlayStation 5
                - generic [ref=e172]: Livre
              - generic [ref=e175] [cursor=pointer]:
                - generic [ref=e176]:
                  - img [ref=e178]
                  - generic [ref=e180]:
                    - paragraph [ref=e181]: Wolf 01
                    - paragraph [ref=e182]: PC Gamer
                - generic [ref=e183]: Livre
              - generic [ref=e186] [cursor=pointer]:
                - generic [ref=e187]:
                  - img [ref=e189]
                  - generic [ref=e191]:
                    - paragraph [ref=e192]: Wolf 02
                    - paragraph [ref=e193]: PC Gamer
                - generic [ref=e194]: Livre
              - generic [ref=e197] [cursor=pointer]:
                - generic [ref=e198]:
                  - img [ref=e200]
                  - generic [ref=e202]:
                    - paragraph [ref=e203]: Wolf 03
                    - paragraph [ref=e204]: PC Gamer
                - generic [ref=e205]: Livre
          - generic [ref=e207]:
            - generic [ref=e208]:
              - heading "Próximas Reservas" [level=3] [ref=e210]
              - generic [ref=e212]:
                - paragraph [ref=e213]: Nenhuma reserva ativa
                - link "Reservar agora" [ref=e214] [cursor=pointer]:
                  - /url: /machines
                  - button "Reservar agora" [ref=e215]
            - generic [ref=e216]:
              - heading "Ações Rápidas" [level=3] [ref=e218]
              - generic [ref=e219]:
                - link "Reservar máquina" [ref=e220] [cursor=pointer]:
                  - /url: /machines
                  - button "Reservar máquina" [ref=e221]:
                    - img [ref=e222]
                    - text: Reservar máquina
                - link "Comprar créditos" [ref=e226] [cursor=pointer]:
                  - /url: /store
                  - button "Comprar créditos" [ref=e227]:
                    - img [ref=e228]
                    - text: Comprar créditos
                - link "Ver ranking" [ref=e231] [cursor=pointer]:
                  - /url: /ranking
                  - button "Ver ranking" [ref=e232]:
                    - img [ref=e233]
                    - text: Ver ranking
  - region "Notifications alt+T"
  - alert [ref=e239]
```

# Test source

```ts
  44  |     { path: "/events", name: "Events", shouldHave: /eventos|campeonatos/i },
  45  |     { path: "/promotions", name: "Promotions", shouldHave: /promoções/i },
  46  |   ];
  47  | 
  48  |   for (const pageInfo of userPages) {
  49  |     test(`${pageInfo.name} carrega corretamente`, async ({ page }) => {
  50  |       const response = await page.goto(pageInfo.path, { waitUntil: "domcontentloaded" });
  51  |       expect(response?.status()).toBeLessThan(500);
  52  |       
  53  |       // Aguarda conteúdo carregar
  54  |       await page.waitForTimeout(2000);
  55  |       
  56  |       // Verifica que a página tem conteúdo esperado ou pelo menos não está em branco
  57  |       const bodyText = await page.locator("body").textContent();
  58  |       expect(bodyText?.trim().length).toBeGreaterThan(100);
  59  |       
  60  |       // Verifica heading ou conteúdo específico
  61  |       if (pageInfo.shouldHave) {
  62  |         const hasContent = await page.locator("body").textContent().then(t => pageInfo.shouldHave.test(t || ""));
  63  |         if (!hasContent) {
  64  |           test.skip(true, `Conteúdo específico não encontrado em ${pageInfo.name}`);
  65  |         }
  66  |       }
  67  |     });
  68  |   }
  69  | });
  70  | 
  71  | // ─── Páginas de Admin ───────────────────────────────────────────────────────
  72  | 
  73  | test.describe("Páginas de Admin", () => {
  74  |   test.use({ storageState: ADMIN_FILE });
  75  | 
  76  |   const adminPages = [
  77  |     { path: "/admin", name: "Admin Dashboard", shouldHave: /admin|painel/i },
  78  |     { path: "/admin/operator", name: "Painel Operador", shouldHave: /operador|máquinas/i },
  79  |     { path: "/admin/machines", name: "Gerenciar Máquinas", shouldHave: /máquinas|wolf|mac/i },
  80  |     { path: "/admin/users", name: "Gerenciar Usuários", shouldHave: /usuários|clientes/i },
  81  |     { path: "/admin/apps", name: "Gerenciar Apps", shouldHave: /apps|aplicativos/i },
  82  |     { path: "/admin/financial", name: "Financeiro", shouldHave: /financeiro|faturamento/i },
  83  |     { path: "/admin/support", name: "Suporte Admin", shouldHave: /suporte|tickets/i },
  84  |     { path: "/admin/settings", name: "Configurações", shouldHave: /configurações|settings/i },
  85  |     { path: "/admin/reservations", name: "Reservas Admin", shouldHave: /reservas/i },
  86  |     { path: "/admin/products", name: "Produtos", shouldHave: /produtos|loja/i },
  87  |     { path: "/admin/events", name: "Eventos Admin", shouldHave: /eventos/i },
  88  |     { path: "/admin/tournaments", name: "Torneios", shouldHave: /torneios|campeonatos/i },
  89  |     { path: "/admin/marketing", name: "Marketing", shouldHave: /marketing/i },
  90  |     { path: "/admin/marketing/ai-agent", name: "AI Agent", shouldHave: /ai|inteligência/i },
  91  |     { path: "/admin/marketing/analytics", name: "Analytics", shouldHave: /analytics|métricas/i },
  92  |     { path: "/admin/marketing/calendar", name: "Calendário", shouldHave: /calendário/i },
  93  |     { path: "/admin/marketing/campaigns", name: "Campanhas", shouldHave: /campanhas/i },
  94  |     { path: "/admin/marketing/creatives", name: "Creatives", shouldHave: /creatives|criativos/i },
  95  |     { path: "/admin/marketing/promotions", name: "Promoções", shouldHave: /promoções/i },
  96  |   ];
  97  | 
  98  |   for (const pageInfo of adminPages) {
  99  |     test(`${pageInfo.name} carrega corretamente`, async ({ page }) => {
  100 |       const response = await page.goto(pageInfo.path, { waitUntil: "domcontentloaded" });
  101 | 
  102 |       // Admin pode redirecionar se não tiver permissão
  103 |       expect(response?.status()).toBeLessThan(500);
  104 | 
  105 |       await page.waitForTimeout(2000);
  106 |       
  107 |       // Verifica que não está em branco
  108 |       const bodyText = await page.locator("body").textContent();
  109 |       expect(bodyText?.trim().length).toBeGreaterThan(100);
  110 |       
  111 |       // Se a URL mudou (redirecionamento de permissão), aceita
  112 |       const currentUrl = page.url();
  113 |       if (currentUrl.includes("/login")) {
  114 |         test.skip(true, "Redirecionado para login - possível problema de permissão");
  115 |       }
  116 |       
  117 |       // Verifica conteúdo esperado
  118 |       if (pageInfo.shouldHave) {
  119 |         const hasContent = await page.locator("body").textContent().then(t => pageInfo.shouldHave.test(t || ""));
  120 |         if (!hasContent) {
  121 |           test.skip(true, `Conteúdo específico não encontrado em ${pageInfo.name}`);
  122 |         }
  123 |       }
  124 |     });
  125 |   }
  126 | });
  127 | 
  128 | // ─── Navegação via Sidebar ─────────────────────────────────────────────────
  129 | 
  130 | test.describe("Navegação via Sidebar — usuário", () => {
  131 |   test.use({ storageState: USER_FILE });
  132 |   test("usuário navega pelo menu lateral", async ({ page }) => {
  133 |     await page.goto("/dashboard");
  134 |     await page.waitForLoadState("domcontentloaded");
  135 |     
  136 |     // Links comuns no sidebar de usuário
  137 |     const sidebarLinks = ["/session", "/store", "/reservations", "/support"];
  138 | 
  139 |     for (const href of sidebarLinks) {
  140 |       const menuItem = page.locator(`nav a[href="${href}"]:visible`).first();
  141 |       if (await menuItem.count() === 0) {
  142 |         test.skip(true, `Link ${href} não visível na sidebar`);
  143 |       }
> 144 |       await menuItem.click();
      |                      ^ Error: locator.click: Test timeout of 90000ms exceeded.
  145 |       await expect(page).toHaveURL(new RegExp(href), { timeout: 30000 });
  146 |       // Volta para dashboard
  147 |       await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  148 |     }
  149 |   });
  150 | });
  151 | 
  152 | test.describe("Navegação via Sidebar — admin", () => {
  153 |   test.use({ storageState: ADMIN_FILE });
  154 |   test("admin navega pelo menu lateral", async ({ page }) => {
  155 |     await page.goto("/admin");
  156 |     await page.waitForLoadState("domcontentloaded");
  157 |     
  158 |     // Links comuns no sidebar de admin
  159 |     const adminSidebarLinks = ["/admin/operator", "/admin/machines", "/admin/users", "/admin/financial"];
  160 | 
  161 |     for (const href of adminSidebarLinks) {
  162 |       const menuItem = page.locator(`nav a[href="${href}"]:visible`).first();
  163 |       if (await menuItem.count() === 0) {
  164 |         test.skip(true, `Link ${href} não visível na sidebar admin`);
  165 |       }
  166 |       await menuItem.click();
  167 |       await expect(page).toHaveURL(new RegExp(href.replace(/\//g, "\\/")), { timeout: 30000 });
  168 |       // Volta para admin
  169 |       await page.goto("/admin", { waitUntil: "domcontentloaded" });
  170 |     }
  171 |   });
  172 | });
  173 | 
  174 | // ─── Navegação Mobile ───────────────────────────────────────────────────────
  175 | 
  176 | test.describe("Navegação Mobile", () => {
  177 |   test.use({ viewport: { width: 375, height: 667 }, storageState: USER_FILE }); // iPhone SE
  178 | 
  179 |   test("menu hamburguer funciona em mobile", async ({ page }) => {
  180 |     await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  181 |     
  182 |     // Procura botão de menu hamburguer
  183 |     const menuBtn = page.getByRole("button").filter({ has: page.locator("[data-menu], svg, .hamburger") }).first()
  184 |       .or(page.getByLabel(/menu|abrir menu/i))
  185 |       .or(page.locator("button").nth(0));
  186 |     
  187 |     if (await menuBtn.isVisible().catch(() => false)) {
  188 |       await menuBtn.click();
  189 |       
  190 |       // Aguarda menu abrir
  191 |       await page.waitForTimeout(500);
  192 |       
  193 |       // Verifica que algum link do menu apareceu
  194 |       const menuLink = page.getByRole("link").filter({ hasText: /dashboard|perfil|sair/i }).first();
  195 |       await expect(menuLink).toBeVisible({ timeout: 3000 });
  196 |     } else {
  197 |       test.skip(true, "Botão de menu hamburguer não encontrado");
  198 |     }
  199 |   });
  200 | });
  201 | 
  202 | // ─── Teste de Performance ───────────────────────────────────────────────────
  203 | 
  204 | test.describe("Performance de Navegação", () => {
  205 |   test.use({ storageState: USER_FILE });
  206 |   test("páginas carregam em tempo aceitável", async ({ page }) => {
  207 |     const pagesToTest = ["/dashboard", "/session", "/store", "/profile"];
  208 | 
  209 |     for (const path of pagesToTest) {
  210 |       const start = Date.now();
  211 |       await page.goto(path, { waitUntil: "domcontentloaded" });
  212 |       const loadTime = Date.now() - start;
  213 | 
  214 |       expect(loadTime).toBeLessThan(15000);
  215 |     }
  216 |   });
  217 | });
  218 | 
  219 | // ─── Teste de 404 ───────────────────────────────────────────────────────────
  220 | 
  221 | test.describe("Páginas Inexistentes", () => {
  222 |   test("página inexistente retorna 404", async ({ page }) => {
  223 |     const response = await page.goto("/pagina-que-nao-existe");
  224 |     
  225 |     // Deve retornar 404 ou redirecionar
  226 |     expect([404, 301, 302, 200]).toContain(response?.status());
  227 |     
  228 |     // Deve mostrar mensagem de erro ou redirecionar para login/dashboard
  229 |     const bodyText = await page.locator("body").textContent();
  230 |     const hasErrorContent = /não encontrada|not found|404|redirect/i.test(bodyText || "");
  231 |     const redirected = page.url() !== "/pagina-que-nao-existe";
  232 |     
  233 |     expect(hasErrorContent || redirected).toBe(true);
  234 |   });
  235 | });
  236 | 
```
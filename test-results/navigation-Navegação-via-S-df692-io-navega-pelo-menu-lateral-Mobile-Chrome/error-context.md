# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navegação via Sidebar >> usuário navega pelo menu lateral
- Location: e2e/navigation.spec.ts:165:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link').filter({ hasText: /usar pc/i }).first()
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
    52 × waiting for element to be visible, enabled and stable
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
        - generic [ref=e12]: 18h
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
            - paragraph [ref=e106]: 18h
          - generic [ref=e108]:
            - generic [ref=e109]:
              - generic [ref=e110]: PCs Livres
              - img [ref=e111]
            - paragraph [ref=e113]:
              - text: "9"
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
  - button "Open Next.js Dev Tools" [ref=e244] [cursor=pointer]:
    - img [ref=e245]
  - alert [ref=e248]
```

# Test source

```ts
  81  |       const response = await page.goto(pageInfo.path);
  82  |       expect(response?.status()).toBeLessThan(500);
  83  |       
  84  |       // Aguarda conteúdo carregar
  85  |       await page.waitForTimeout(2000);
  86  |       
  87  |       // Verifica que a página tem conteúdo esperado ou pelo menos não está em branco
  88  |       const bodyText = await page.locator("body").textContent();
  89  |       expect(bodyText?.trim().length).toBeGreaterThan(100);
  90  |       
  91  |       // Verifica heading ou conteúdo específico
  92  |       if (pageInfo.shouldHave) {
  93  |         const hasContent = await page.locator("body").textContent().then(t => pageInfo.shouldHave.test(t || ""));
  94  |         if (!hasContent) {
  95  |           test.skip(true, `Conteúdo específico não encontrado em ${pageInfo.name}`);
  96  |         }
  97  |       }
  98  |     });
  99  |   }
  100 | });
  101 | 
  102 | // ─── Páginas de Admin ───────────────────────────────────────────────────────
  103 | 
  104 | test.describe("Páginas de Admin", () => {
  105 |   test.beforeEach(async ({ page }) => {
  106 |     await loginAsAdmin(page);
  107 |   });
  108 | 
  109 |   const adminPages = [
  110 |     { path: "/admin", name: "Admin Dashboard", shouldHave: /admin|painel/i },
  111 |     { path: "/admin/operator", name: "Painel Operador", shouldHave: /operador|máquinas/i },
  112 |     { path: "/admin/machines", name: "Gerenciar Máquinas", shouldHave: /máquinas|wolf|mac/i },
  113 |     { path: "/admin/users", name: "Gerenciar Usuários", shouldHave: /usuários|clientes/i },
  114 |     { path: "/admin/apps", name: "Gerenciar Apps", shouldHave: /apps|aplicativos/i },
  115 |     { path: "/admin/financial", name: "Financeiro", shouldHave: /financeiro|faturamento/i },
  116 |     { path: "/admin/support", name: "Suporte Admin", shouldHave: /suporte|tickets/i },
  117 |     { path: "/admin/settings", name: "Configurações", shouldHave: /configurações|settings/i },
  118 |     { path: "/admin/reservations", name: "Reservas Admin", shouldHave: /reservas/i },
  119 |     { path: "/admin/products", name: "Produtos", shouldHave: /produtos|loja/i },
  120 |     { path: "/admin/events", name: "Eventos Admin", shouldHave: /eventos/i },
  121 |     { path: "/admin/tournaments", name: "Torneios", shouldHave: /torneios|campeonatos/i },
  122 |     { path: "/admin/marketing", name: "Marketing", shouldHave: /marketing/i },
  123 |     { path: "/admin/marketing/ai-agent", name: "AI Agent", shouldHave: /ai|inteligência/i },
  124 |     { path: "/admin/marketing/analytics", name: "Analytics", shouldHave: /analytics|métricas/i },
  125 |     { path: "/admin/marketing/calendar", name: "Calendário", shouldHave: /calendário/i },
  126 |     { path: "/admin/marketing/campaigns", name: "Campanhas", shouldHave: /campanhas/i },
  127 |     { path: "/admin/marketing/creatives", name: "Creatives", shouldHave: /creatives|criativos/i },
  128 |     { path: "/admin/marketing/promotions", name: "Promoções", shouldHave: /promoções/i },
  129 |   ];
  130 | 
  131 |   for (const pageInfo of adminPages) {
  132 |     test(`${pageInfo.name} carrega corretamente`, async ({ page }) => {
  133 |       const response = await page.goto(pageInfo.path);
  134 |       
  135 |       // Admin pode redirecionar se não tiver permissão
  136 |       expect(response?.status()).toBeLessThan(500);
  137 |       
  138 |       await page.waitForLoadState("domcontentloaded");
  139 |       await page.waitForTimeout(2000);
  140 |       
  141 |       // Verifica que não está em branco
  142 |       const bodyText = await page.locator("body").textContent();
  143 |       expect(bodyText?.trim().length).toBeGreaterThan(100);
  144 |       
  145 |       // Se a URL mudou (redirecionamento de permissão), aceita
  146 |       const currentUrl = page.url();
  147 |       if (currentUrl.includes("/login")) {
  148 |         test.skip(true, "Redirecionado para login - possível problema de permissão");
  149 |       }
  150 |       
  151 |       // Verifica conteúdo esperado
  152 |       if (pageInfo.shouldHave) {
  153 |         const hasContent = await page.locator("body").textContent().then(t => pageInfo.shouldHave.test(t || ""));
  154 |         if (!hasContent) {
  155 |           test.skip(true, `Conteúdo específico não encontrado em ${pageInfo.name}`);
  156 |         }
  157 |       }
  158 |     });
  159 |   }
  160 | });
  161 | 
  162 | // ─── Navegação via Sidebar ─────────────────────────────────────────────────
  163 | 
  164 | test.describe("Navegação via Sidebar", () => {
  165 |   test("usuário navega pelo menu lateral", async ({ page }) => {
  166 |     await loginAsUser(page);
  167 |     await page.goto("/dashboard");
  168 |     await page.waitForLoadState("domcontentloaded");
  169 |     
  170 |     // Links comuns no sidebar de usuário
  171 |     const sidebarLinks = [
  172 |       { text: /usar pc/i, expectedPath: /session/ },
  173 |       { text: /loja|store/i, expectedPath: /store/ },
  174 |       { text: /reservas/i, expectedPath: /reservations/ },
  175 |       { text: /suporte/i, expectedPath: /support/ },
  176 |     ];
  177 |     
  178 |     for (const link of sidebarLinks) {
  179 |       const menuItem = page.getByRole("link").filter({ hasText: link.text }).first();
  180 |       if (await menuItem.isVisible().catch(() => false)) {
> 181 |         await menuItem.click();
      |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  182 |         await page.waitForLoadState("domcontentloaded");
  183 |         await expect(page).toHaveURL(link.expectedPath);
  184 |         // Volta para dashboard
  185 |         await page.goto("/dashboard");
  186 |       }
  187 |     }
  188 |   });
  189 | 
  190 |   test("admin navega pelo menu lateral", async ({ page }) => {
  191 |     await loginAsAdmin(page);
  192 |     await page.goto("/admin");
  193 |     await page.waitForLoadState("domcontentloaded");
  194 |     
  195 |     // Links comuns no sidebar de admin
  196 |     const adminSidebarLinks = [
  197 |       { text: /painel operador/i, expectedPath: /admin\/operator/ },
  198 |       { text: /máquinas/i, expectedPath: /admin\/machines/ },
  199 |       { text: /usuários/i, expectedPath: /admin\/users/ },
  200 |       { text: /financeiro/i, expectedPath: /admin\/financial/ },
  201 |     ];
  202 |     
  203 |     for (const link of adminSidebarLinks) {
  204 |       const menuItem = page.getByRole("link").filter({ hasText: link.text }).first();
  205 |       if (await menuItem.isVisible().catch(() => false)) {
  206 |         await menuItem.click();
  207 |         await page.waitForLoadState("domcontentloaded");
  208 |         await expect(page).toHaveURL(link.expectedPath);
  209 |         // Volta para admin
  210 |         await page.goto("/admin");
  211 |       } else {
  212 |         // Pode estar em menu hamburguer no mobile
  213 |         test.skip(true, `Link ${link.text} não visível - pode estar no menu mobile`);
  214 |       }
  215 |     }
  216 |   });
  217 | });
  218 | 
  219 | // ─── Navegação Mobile ───────────────────────────────────────────────────────
  220 | 
  221 | test.describe("Navegação Mobile", () => {
  222 |   test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  223 | 
  224 |   test("menu hamburguer funciona em mobile", async ({ page }) => {
  225 |     await loginAsUser(page);
  226 |     await page.goto("/dashboard");
  227 |     await page.waitForLoadState("domcontentloaded");
  228 |     
  229 |     // Procura botão de menu hamburguer
  230 |     const menuBtn = page.getByRole("button").filter({ has: page.locator("[data-menu], svg, .hamburger") }).first()
  231 |       .or(page.getByLabel(/menu|abrir menu/i))
  232 |       .or(page.locator("button").nth(0));
  233 |     
  234 |     if (await menuBtn.isVisible().catch(() => false)) {
  235 |       await menuBtn.click();
  236 |       
  237 |       // Aguarda menu abrir
  238 |       await page.waitForTimeout(500);
  239 |       
  240 |       // Verifica que algum link do menu apareceu
  241 |       const menuLink = page.getByRole("link").filter({ hasText: /dashboard|perfil|sair/i }).first();
  242 |       await expect(menuLink).toBeVisible({ timeout: 3000 });
  243 |     } else {
  244 |       test.skip(true, "Botão de menu hamburguer não encontrado");
  245 |     }
  246 |   });
  247 | });
  248 | 
  249 | // ─── Teste de Performance ───────────────────────────────────────────────────
  250 | 
  251 | test.describe("Performance de Navegação", () => {
  252 |   test("páginas carregam em menos de 3 segundos", async ({ page }) => {
  253 |     await loginAsUser(page);
  254 |     
  255 |     const pagesToTest = ["/dashboard", "/session", "/store", "/profile"];
  256 |     
  257 |     for (const path of pagesToTest) {
  258 |       const start = Date.now();
  259 |       await page.goto(path);
  260 |       await page.waitForLoadState("domcontentloaded");
  261 |       const loadTime = Date.now() - start;
  262 |       
  263 |       expect(loadTime).toBeLessThan(3000);
  264 |     }
  265 |   });
  266 | });
  267 | 
  268 | // ─── Teste de 404 ───────────────────────────────────────────────────────────
  269 | 
  270 | test.describe("Páginas Inexistentes", () => {
  271 |   test("página inexistente retorna 404", async ({ page }) => {
  272 |     const response = await page.goto("/pagina-que-nao-existe");
  273 |     
  274 |     // Deve retornar 404 ou redirecionar
  275 |     expect([404, 301, 302, 200]).toContain(response?.status());
  276 |     
  277 |     // Deve mostrar mensagem de erro ou redirecionar para login/dashboard
  278 |     const bodyText = await page.locator("body").textContent();
  279 |     const hasErrorContent = /não encontrada|not found|404|redirect/i.test(bodyText || "");
  280 |     const redirected = page.url() !== "/pagina-que-nao-existe";
  281 |     
```
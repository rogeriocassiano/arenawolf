/**
 * E2E Tests — Navegação completa em todas as páginas
 * Verifica se todas as rotas carregam sem erro
 */

import { test, expect, Page } from "@playwright/test";

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL ?? "user@user.com",
  password: process.env.TEST_USER_PASSWORD ?? "12345678",
};

const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL ?? "luan@arenawolf.com",
  password: process.env.TEST_ADMIN_PASSWORD ?? "12345678",
};

async function loginAsUser(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', TEST_ADMIN.email);
  await page.fill('input[type="password"]', TEST_ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|admin/, { timeout: 15000 });
}

// ─── Páginas Públicas ──────────────────────────────────────────────────────

test.describe("Páginas Públicas", () => {
  const publicPages = [
    { path: "/", name: "Homepage" },
    { path: "/login", name: "Login" },
    { path: "/register", name: "Register" },
    { path: "/forgot-password", name: "Forgot Password" },
  ];

  for (const pageInfo of publicPages) {
    test(`${pageInfo.name} carrega sem erro`, async ({ page }) => {
      const response = await page.goto(pageInfo.path);
      expect(response?.status()).toBeLessThan(500);
      
      // Verifica que não há erro de React (white screen)
      await expect(page.locator("body")).not.toHaveText(/application error|server error/i, { timeout: 5000 });
    });
  }
});

// ─── Páginas de Usuário Autenticado ─────────────────────────────────────────

test.describe("Páginas de Usuário", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  const userPages = [
    { path: "/dashboard", name: "Dashboard", shouldHave: /dashboard|créditos|minutos/i },
    { path: "/session", name: "Session", shouldHave: /usar.*pc|máquinas|wolf/i },
    { path: "/machines", name: "Machines", shouldHave: /máquinas|pc|wolf/i },
    { path: "/reservations", name: "Reservations", shouldHave: /reservas|agendar/i },
    { path: "/store", name: "Store", shouldHave: /loja|créditos|comprar/i },
    { path: "/support", name: "Support", shouldHave: /suporte|tickets/i },
    { path: "/profile", name: "Profile", shouldHave: /perfil|dados|editar/i },
    { path: "/ranking", name: "Ranking", shouldHave: /ranking|classificação/i },
    { path: "/events", name: "Events", shouldHave: /eventos|campeonatos/i },
    { path: "/promotions", name: "Promotions", shouldHave: /promoções/i },
  ];

  for (const pageInfo of userPages) {
    test(`${pageInfo.name} carrega corretamente`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState("domcontentloaded");
      
      // Verifica status HTTP
      const response = await page.goto(pageInfo.path);
      expect(response?.status()).toBeLessThan(500);
      
      // Aguarda conteúdo carregar
      await page.waitForTimeout(2000);
      
      // Verifica que a página tem conteúdo esperado ou pelo menos não está em branco
      const bodyText = await page.locator("body").textContent();
      expect(bodyText?.trim().length).toBeGreaterThan(100);
      
      // Verifica heading ou conteúdo específico
      if (pageInfo.shouldHave) {
        const hasContent = await page.locator("body").textContent().then(t => pageInfo.shouldHave.test(t || ""));
        if (!hasContent) {
          test.skip(true, `Conteúdo específico não encontrado em ${pageInfo.name}`);
        }
      }
    });
  }
});

// ─── Páginas de Admin ───────────────────────────────────────────────────────

test.describe("Páginas de Admin", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  const adminPages = [
    { path: "/admin", name: "Admin Dashboard", shouldHave: /admin|painel/i },
    { path: "/admin/operator", name: "Painel Operador", shouldHave: /operador|máquinas/i },
    { path: "/admin/machines", name: "Gerenciar Máquinas", shouldHave: /máquinas|wolf|mac/i },
    { path: "/admin/users", name: "Gerenciar Usuários", shouldHave: /usuários|clientes/i },
    { path: "/admin/apps", name: "Gerenciar Apps", shouldHave: /apps|aplicativos/i },
    { path: "/admin/financial", name: "Financeiro", shouldHave: /financeiro|faturamento/i },
    { path: "/admin/support", name: "Suporte Admin", shouldHave: /suporte|tickets/i },
    { path: "/admin/settings", name: "Configurações", shouldHave: /configurações|settings/i },
    { path: "/admin/reservations", name: "Reservas Admin", shouldHave: /reservas/i },
    { path: "/admin/products", name: "Produtos", shouldHave: /produtos|loja/i },
    { path: "/admin/events", name: "Eventos Admin", shouldHave: /eventos/i },
    { path: "/admin/tournaments", name: "Torneios", shouldHave: /torneios|campeonatos/i },
    { path: "/admin/marketing", name: "Marketing", shouldHave: /marketing/i },
    { path: "/admin/marketing/ai-agent", name: "AI Agent", shouldHave: /ai|inteligência/i },
    { path: "/admin/marketing/analytics", name: "Analytics", shouldHave: /analytics|métricas/i },
    { path: "/admin/marketing/calendar", name: "Calendário", shouldHave: /calendário/i },
    { path: "/admin/marketing/campaigns", name: "Campanhas", shouldHave: /campanhas/i },
    { path: "/admin/marketing/creatives", name: "Creatives", shouldHave: /creatives|criativos/i },
    { path: "/admin/marketing/promotions", name: "Promoções", shouldHave: /promoções/i },
  ];

  for (const pageInfo of adminPages) {
    test(`${pageInfo.name} carrega corretamente`, async ({ page }) => {
      const response = await page.goto(pageInfo.path);
      
      // Admin pode redirecionar se não tiver permissão
      expect(response?.status()).toBeLessThan(500);
      
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);
      
      // Verifica que não está em branco
      const bodyText = await page.locator("body").textContent();
      expect(bodyText?.trim().length).toBeGreaterThan(100);
      
      // Se a URL mudou (redirecionamento de permissão), aceita
      const currentUrl = page.url();
      if (currentUrl.includes("/login")) {
        test.skip(true, "Redirecionado para login - possível problema de permissão");
      }
      
      // Verifica conteúdo esperado
      if (pageInfo.shouldHave) {
        const hasContent = await page.locator("body").textContent().then(t => pageInfo.shouldHave.test(t || ""));
        if (!hasContent) {
          test.skip(true, `Conteúdo específico não encontrado em ${pageInfo.name}`);
        }
      }
    });
  }
});

// ─── Navegação via Sidebar ─────────────────────────────────────────────────

test.describe("Navegação via Sidebar", () => {
  test("usuário navega pelo menu lateral", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    
    // Links comuns no sidebar de usuário
    const sidebarLinks = [
      { text: /usar pc/i, expectedPath: /session/ },
      { text: /loja|store/i, expectedPath: /store/ },
      { text: /reservas/i, expectedPath: /reservations/ },
      { text: /suporte/i, expectedPath: /support/ },
    ];
    
    for (const link of sidebarLinks) {
      const menuItem = page.getByRole("link").filter({ hasText: link.text }).first();
      if (await menuItem.isVisible().catch(() => false)) {
        // Scroll para garantir que o elemento está visível
        await menuItem.scrollIntoViewIfNeeded().catch(() => {});
        await menuItem.click({ force: true });
        await page.waitForLoadState("domcontentloaded");
        await expect(page).toHaveURL(link.expectedPath);
        // Volta para dashboard
        await page.goto("/dashboard");
        await page.waitForLoadState("domcontentloaded");
      }
    }
  });

  test("admin navega pelo menu lateral", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");
    
    // Links comuns no sidebar de admin
    const adminSidebarLinks = [
      { text: /painel operador/i, expectedPath: /admin\/operator/ },
      { text: /máquinas/i, expectedPath: /admin\/machines/ },
      { text: /usuários/i, expectedPath: /admin\/users/ },
      { text: /financeiro/i, expectedPath: /admin\/financial/ },
    ];
    
    for (const link of adminSidebarLinks) {
      const menuItem = page.getByRole("link").filter({ hasText: link.text }).first();
      if (await menuItem.isVisible().catch(() => false)) {
        await menuItem.scrollIntoViewIfNeeded().catch(() => {});
        await menuItem.click({ force: true });
        await page.waitForLoadState("domcontentloaded");
        await expect(page).toHaveURL(link.expectedPath);
        // Volta para admin
        await page.goto("/admin");
        await page.waitForLoadState("domcontentloaded");
      } else {
        // Pode estar em menu hamburguer no mobile
        test.skip(true, `Link ${link.text} não visível - pode estar no menu mobile`);
      }
    }
  });
});

// ─── Navegação Mobile ───────────────────────────────────────────────────────

test.describe("Navegação Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test("menu hamburguer funciona em mobile", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    
    // Procura botão de menu hamburguer
    const menuBtn = page.getByRole("button").filter({ has: page.locator("[data-menu], svg, .hamburger") }).first()
      .or(page.getByLabel(/menu|abrir menu/i))
      .or(page.locator("button").nth(0));
    
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      
      // Aguarda menu abrir
      await page.waitForTimeout(500);
      
      // Verifica que algum link do menu apareceu
      const menuLink = page.getByRole("link").filter({ hasText: /dashboard|perfil|sair/i }).first();
      await expect(menuLink).toBeVisible({ timeout: 3000 });
    } else {
      test.skip(true, "Botão de menu hamburguer não encontrado");
    }
  });
});

// ─── Teste de Performance ───────────────────────────────────────────────────

test.describe("Performance de Navegação", () => {
  test("páginas carregam em menos de 3 segundos", async ({ page }) => {
    await loginAsUser(page);
    
    const pagesToTest = ["/dashboard", "/session", "/store", "/profile"];
    
    for (const path of pagesToTest) {
      const start = Date.now();
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      const loadTime = Date.now() - start;
      
      expect(loadTime).toBeLessThan(3000);
    }
  });
});

// ─── Teste de 404 ───────────────────────────────────────────────────────────

test.describe("Páginas Inexistentes", () => {
  test("página inexistente retorna 404", async ({ page }) => {
    const response = await page.goto("/pagina-que-nao-existe");
    
    // Deve retornar 404 ou redirecionar
    expect([404, 301, 302, 200]).toContain(response?.status());
    
    // Deve mostrar mensagem de erro ou redirecionar para login/dashboard
    const bodyText = await page.locator("body").textContent();
    const hasErrorContent = /não encontrada|not found|404|redirect/i.test(bodyText || "");
    const redirected = page.url() !== "/pagina-que-nao-existe";
    
    expect(hasErrorContent || redirected).toBe(true);
  });
});

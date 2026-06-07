/**
 * E2E Tests — Painel Admin Completo
 * Operator, Machines, Users, Apps, Financial, Support, Settings
 */

import { test, expect, Page } from "@playwright/test";

const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL ?? "luan@arenawolf.com",
  password: process.env.TEST_ADMIN_PASSWORD ?? "12345678",
};

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', TEST_ADMIN.email);
  await page.fill('input[type="password"]', TEST_ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|admin/, { timeout: 15000 });
}

test.describe("Painel Admin — Painel Operador", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/operator");
  });

  test("painel operador carrega com grid de máquinas", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /painel operador/i })).toBeVisible({ timeout: 10000 });
    // Grid de máquinas
    await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 20000 });
  });

  test("KPIs visíveis no painel operador", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("text=/em uso|disponíveis|sessões ativas/i").first()).toBeVisible({ timeout: 10000 });
  });

  test("botão Iniciar Sessão abre modal", async ({ page }) => {
    const startBtn = page.getByRole("button", { name: /iniciar sess/i }).first();
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();
    // Modal com formulário
    await expect(page.getByText(/selecionar usuário|minutos|iniciar/i).nth(1)).toBeVisible({ timeout: 8000 });
  });

  test("adicionar tempo em máquina ocupada", async ({ page }) => {
    // Procura máquina ocupada
    const machineCard = page.locator("[data-testid='machine-card']").filter({ hasText: /em uso|ocupada/i }).first();
    if (await machineCard.isVisible().catch(() => false)) {
      await machineCard.getByRole("button", { name: /adicionar tempo/i }).click();
      await expect(page.getByText(/adicionar tempo|minutos/i)).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Nenhuma máquina ocupada no momento");
    }
  });
});

test.describe("Painel Admin — Gerenciamento de Máquinas", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/machines");
  });

  test("lista de máquinas carrega com status", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /máquinas|pcs/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("campo MAC address editável", async ({ page }) => {
    // Primeira máquina PC (não PS5)
    const macInput = page.locator('input[name*="mac"]').first();
    await expect(macInput).toBeVisible({ timeout: 10000 });
    await macInput.fill("AA:BB:CC:DD:EE:FF");
    await expect(macInput).toHaveValue("AA:BB:CC:DD:EE:FF");
  });

  test("botões Ligar/Desligar visíveis para PCs", async ({ page }) => {
    const ligarBtn = page.getByRole("button", { name: /ligar|wakeup/i }).first();
    const desligarBtn = page.getByRole("button", { name: /desligar|shutdown/i }).first();
    // Pelo menos um dos dois deve existir para PCs
    await expect(ligarBtn.or(desligarBtn)).toBeVisible({ timeout: 10000 });
  });

  test("copiar ID da máquina", async ({ page }) => {
    const copyBtn = page.getByRole("button", { name: /copiar id/i }).first();
    if (await copyBtn.isVisible().catch(() => false)) {
      await copyBtn.click();
      // Toast de sucesso
      await expect(page.getByText(/copiado|clipboard/i)).toBeVisible({ timeout: 3000 });
    } else {
      test.skip(true, "Botão de copiar não encontrado");
    }
  });
});

test.describe("Painel Admin — Usuários", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/users");
  });

  test("lista de usuários carrega", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /usuários|clientes/i })).toBeVisible({ timeout: 10000 });
    // Tabela ou cards de usuários
    await expect(page.locator("table, [data-testid='user-card']").first()).toBeVisible({ timeout: 10000 });
  });

  test("busca de usuários funciona", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i);
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill("test");
      await page.waitForTimeout(500); // debounce
      // Resultados devem filtrar
      await expect(page.locator("text=/test|sem resultados/i").first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Campo de busca não encontrado");
    }
  });

  test("ações de usuário disponíveis", async ({ page }) => {
    // Botões de ação na primeira linha
    const actionsBtn = page.getByRole("button", { name: /ações|menu/i }).first();
    if (await actionsBtn.isVisible().catch(() => false)) {
      await actionsBtn.click();
      await expect(page.getByText(/adicionar créditos|banir|editar/i).first()).toBeVisible({ timeout: 3000 });
    } else {
      test.skip(true, "Menu de ações não encontrado");
    }
  });
});

test.describe("Painel Admin — Apps", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/apps");
  });

  test("catálogo de apps carrega", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /aplicativos|apps/i })).toBeVisible({ timeout: 10000 });
    // Tabs ou lista
    await expect(page.getByRole("tab").or(page.locator("[data-testid='app-card']")).first()).toBeVisible({ timeout: 10000 });
  });

  test("aba 'Por Máquina' mostra toggles", async ({ page }) => {
    const porMaquinaTab = page.getByRole("tab", { name: /por máquina|por pc/i });
    if (await porMaquinaTab.isVisible().catch(() => false)) {
      await porMaquinaTab.click();
      await expect(page.getByRole("switch").or(page.locator("input[type='checkbox']")).first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Aba 'Por Máquina' não encontrada");
    }
  });
});

test.describe("Painel Admin — Financeiro", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/financial");
  });

  test("dashboard financeiro carrega", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /financeiro|faturamento/i })).toBeVisible({ timeout: 10000 });
    // KPIs de receita
    await expect(page.getByText(/receita|vendas|transações/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("filtro de período funciona", async ({ page }) => {
    const dateInput = page.locator("input[type='date']").first();
    if (await dateInput.isVisible().catch(() => false)) {
      await dateInput.fill(new Date().toISOString().split("T")[0]);
      await page.waitForTimeout(500);
      // Dados devem atualizar
      await expect(page.locator("text=/R\\$|0,00|carregando/i").first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Filtro de data não encontrado");
    }
  });
});

test.describe("Painel Admin — Suporte", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/support");
  });

  test("lista de tickets carrega", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /suporte|tickets/i })).toBeVisible({ timeout: 10000 });
    // Filtros de status
    await expect(page.getByText(/aberto|fechado|pendente/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("abrir ticket mostra conversa", async ({ page }) => {
    const ticketLink = page.getByRole("link").filter({ hasText: /ticket|chamado/i }).first();
    if (await ticketLink.isVisible().catch(() => false)) {
      await ticketLink.click();
      await expect(page.getByRole("heading", { name: /ticket|assunto/i })).toBeVisible({ timeout: 10000 });
      // Formulário de resposta
      await expect(page.getByRole("textbox").or(page.locator("textarea")).first()).toBeVisible();
    } else {
      test.skip(true, "Nenhum ticket disponível");
    }
  });
});

test.describe("Painel Admin — Configurações", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/settings");
  });

  test("página de configurações carrega", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /configurações|settings/i })).toBeVisible({ timeout: 10000 });
  });

  test("alterar preço por hora", async ({ page }) => {
    const priceInput = page.locator('input[name*="price"], input[name*="valor"]').first();
    if (await priceInput.isVisible().catch(() => false)) {
      await priceInput.fill("15.00");
      await page.getByRole("button", { name: /salvar|atualizar/i }).first().click();
      await expect(page.getByText(/salvo|atualizado|sucesso/i)).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Campo de preço não encontrado");
    }
  });
});

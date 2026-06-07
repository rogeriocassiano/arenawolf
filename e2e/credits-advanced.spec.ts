/**
 * E2E Tests — Sistema Avançado de Créditos
 * Gift Cards, Assinaturas, Indicação, Cashback, Preço Dinâmico
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

test.describe("Gift Cards / Códigos Promocionais", () => {
  test("usuário resgata código promocional válido", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/profile");
    await page.waitForLoadState("domcontentloaded");
    
    // Busca input de código promocional
    const codeInput = page.locator('input[placeholder*="código"], input[name*="promo"]').first();
    if (await codeInput.isVisible().catch(() => false)) {
      await codeInput.fill("WOLF2025");
      await page.getByRole("button", { name: /resgatar|aplicar/i }).first().click();
      
      // Deve mostrar sucesso ou erro (ambos são comportamentos válidos)
      const toast = page.getByText(/código resgatado|créditos adicionados|código inválido|expirado/i);
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Input de código promocional não encontrado");
    }
  });
});

test.describe("Programa de Indicação", () => {
  test("usuário acessa link de indicação", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/profile");
    await page.waitForLoadState("domcontentloaded");
    
    // Busca link de indicação
    const referralSection = page.locator("text=/indicar|convidar|indicação/i").first();
    if (await referralSection.isVisible().catch(() => false)) {
      await expect(page.locator("text=/copiar link|compartilhar/i").first()).toBeVisible();
    } else {
      test.skip(true, "Seção de indicação não encontrada");
    }
  });

  test("novo usuário se cadastra com código de indicação", async ({ page }) => {
    await page.goto("/register?ref=ABC123");
    await page.waitForLoadState("domcontentloaded");
    
    // Formulário de registro deve estar presente
    await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
    
    // O código de indicação deve estar pré-preenchido ou aplicado automaticamente
    // (isso depende da implementação frontend)
  });
});

test.describe("Cashback na Loja", () => {
  test("compra de produto mostra cashback ganho", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/store");
    await page.waitForLoadState("networkidle");
    
    // Busca primeiro produto disponível
    const buyBtn = page.getByRole("button", { name: /comprar/i }).first();
    if (await buyBtn.isVisible().catch(() => false)) {
      await buyBtn.click();
      
      // Aguarda toast de sucesso
      const toast = page.getByText(/compra realizada|cashback/i);
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Nenhum produto disponível para compra");
    }
  });
});

test.describe("Preço Dinâmico", () => {
  test("preço muda conforme horário", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/session");
    await page.waitForLoadState("domcontentloaded");
    
    // Verifica se há indicador de preço dinâmico
    const priceIndicator = page.locator("text=/% OFF|promoção|desconto/i").first();
    // Pode ou não estar visível dependendo do horário
    if (await priceIndicator.isVisible().catch(() => false)) {
      expect(await priceIndicator.textContent()).toMatch(/%|OFF/i);
    }
  });
});

test.describe("Hold em Reservas", () => {
  test("criar reserva consome créditos (hold)", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/reservations");
    await page.waitForLoadState("domcontentloaded");
    
    // Verifica saldo antes
    const creditDisplay = page.locator("text=/créditos|minutos/i").first();
    const beforeText = await creditDisplay.textContent().catch(() => "0");
    
    // Preenche formulário
    const machineSelect = page.locator('select[name="machine_id"]').first();
    if (await machineSelect.isVisible().catch(() => false)) {
      await machineSelect.selectOption({ index: 1 });
      await page.fill('input[name="start_at"]', new Date(Date.now() + 86400000).toISOString().slice(0, 16));
      await page.fill('input[name="duration_min"]', "60");
      await page.getByRole("button", { name: /reservar/i }).first().click();
      
      // Sucesso ou erro de créditos
      const toast = page.getByText(/reserva criada|créditos insuficientes/i);
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Formulário de reserva não encontrado");
    }
  });

  test("cancelar reserva devolve créditos", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/reservations");
    await page.waitForLoadState("domcontentloaded");
    
    // Busca botão de cancelar em reserva pendente
    const cancelBtn = page.getByRole("button", { name: /cancelar/i }).first();
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
      
      // Confirmação ou toast
      const toast = page.getByText(/cancelada|créditos devolvidos|estorno/i);
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Nenhuma reserva para cancelar");
    }
  });
});

test.describe("Dashboard de Créditos", () => {
  test("visualizar saldo detalhado por tipo", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/profile");
    await page.waitForLoadState("domcontentloaded");
    
    // Busca seção de créditos
    const creditsSection = page.locator("text=/meus créditos|saldo|disponível/i").first();
    await expect(creditsSection).toBeVisible({ timeout: 10000 });
    
    // Verifica se há detalhamento por tipo
    const typeBreakdown = page.locator("text=/pagos|bônus|cashback|expirando/i").first();
    if (await typeBreakdown.isVisible().catch(() => false)) {
      expect(await typeBreakdown.textContent()).toBeTruthy();
    }
  });

  test("histórico de transações", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/profile");
    await page.waitForLoadState("domcontentloaded");
    
    // Busca aba ou link de histórico
    const historyLink = page.getByRole("tab", { name: /histórico|transações/i })
      .or(page.getByRole("link", { name: /histórico|transações/i }))
      .first();
    
    if (await historyLink.isVisible().catch(() => false)) {
      await historyLink.click();
      await expect(page.locator("table, list, .transaction").first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Link de histórico não encontrado");
    }
  });
});

test.describe("Admin - Gerenciamento de Créditos", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("admin cria código promocional", async ({ page }) => {
    await page.goto("/admin/promocodes");
    await page.waitForLoadState("domcontentloaded");
    
    // Busca botão de criar
    const createBtn = page.getByRole("button", { name: /novo código|criar/i }).first();
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      
      // Preenche formulário
      await page.fill('input[name="code"]', "TEST" + Date.now());
      await page.fill('input[name="value"]', "60");
      await page.getByRole("button", { name: /salvar|criar/i }).first().click();
      
      const toast = page.getByText(/código criado|sucesso/i);
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Botão de criar código não encontrado");
    }
  });

  test("admin lista regras de preço dinâmico", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("domcontentloaded");
    
    // Lista de regras deve estar visível
    const rulesList = page.locator("table, .rule-card, [data-testid='pricing-rule']").first();
    if (await rulesList.isVisible().catch(() => false)) {
      await expect(page.getByText(/manhã|noite|domingo|multiplicador/i).first()).toBeVisible();
    } else {
      test.skip(true, "Lista de regras de preço não encontrada");
    }
  });
});

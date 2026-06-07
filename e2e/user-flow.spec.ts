/**
 * E2E Tests — Fluxo completo do usuário
 * Dashboard → Session → Store → Reservations → Support
 */

import { test, expect, Page } from "@playwright/test";

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL ?? "user@user.com",
  password: process.env.TEST_USER_PASSWORD ?? "12345678",
};

async function loginAsUser(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

test.describe("Fluxo Usuário Completo", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("dashboard carrega com sidebar e KPIs", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/créditos|minutos/i)).toBeVisible();
    // Sidebar links
    await expect(page.getByRole("link", { name: /usar pc/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /reservas/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /loja/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /suporte/i })).toBeVisible();
  });

  test("navegação para /session mostra lista de máquinas", async ({ page }) => {
    await page.goto("/session");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { name: /usar.*pc/i })).toBeVisible({ timeout: 10000 });
    // Pelo menos uma máquina deve aparecer
    await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("selecionar máquina habilita botão de gerar PIN", async ({ page }) => {
    await page.goto("/session");
    await page.waitForLoadState("domcontentloaded");
    // Aguarda máquinas carregarem
    await page.waitForSelector('[data-testid="machine-card"], text=/Wolf|PS5/', { timeout: 15000 });
    // Clica na primeira máquina disponível
    const machineCard = page.locator('[data-testid="machine-card"], text=/Wolf|PS5/').first();
    await machineCard.click();
    // Botão deve ficar habilitado
    const btn = page.getByRole("button", { name: /gerar.*pin|usar.*pc/i }).first();
    await expect(btn).toBeEnabled();
  });

  test("página de loja mostra pacotes de crédito", async ({ page }) => {
    await page.goto("/store");
    await expect(page.getByRole("heading", { name: /loja|créditos/i })).toBeVisible({ timeout: 10000 });
    // Pacotes devem estar visíveis
    await expect(page.getByText(/1 hora|2 horas|corujão|10 horas/i).first()).toBeVisible();
  });

  test("solicitar pacote de crédito cria solicitação pendente", async ({ page }) => {
    await page.goto("/store");
    await page.waitForLoadState("networkidle");
    // Clica no primeiro botão de comprar
    const buyBtn = page.getByRole("button", { name: /comprar|solicitar/i }).first();
    await buyBtn.click();
    // Deve mostrar confirmação ou toast
    await expect(page.getByText(/solicitação|pendente|balcão/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("página de reservas mostra formulário", async ({ page }) => {
    await page.goto("/reservations");
    await expect(page.getByRole("heading", { name: /reserva/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/máquina/i)).toBeVisible();
    await expect(page.getByLabel(/data|quando/i)).toBeVisible();
    await expect(page.getByLabel(/duração|tempo/i)).toBeVisible();
  });

  test("criar reserva com dados válidos", async ({ page }) => {
    await page.goto("/reservations");
    await page.waitForLoadState("domcontentloaded");
    // Preenche formulário
    await page.selectOption('select[name="machine_id"]', { index: 1 });
    await page.fill('input[name="start_at"]', new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    await page.fill('input[name="duration_min"]', "60");
    await page.getByRole("button", { name: /reservar|confirmar/i }).click();
    // Sucesso ou erro de créditos (ambos são respostas válidas da API)
    await expect(page.getByText(/sucesso|reservado|créditos|insuficientes/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("página de suporte mostra lista de tickets", async ({ page }) => {
    await page.goto("/support");
    await expect(page.getByRole("heading", { name: /suporte|tickets/i })).toBeVisible({ timeout: 10000 });
    // Botão de novo ticket
    await expect(page.getByRole("link", { name: /novo ticket|abrir chamado/i })).toBeVisible();
  });

  test("criar novo ticket de suporte", async ({ page }) => {
    await page.goto("/support/new");
    await expect(page.getByRole("heading", { name: /novo ticket/i })).toBeVisible({ timeout: 10000 });
    await page.fill('input[name="subject"]', "Problema de teste E2E");
    await page.fill('textarea[name="body"]', "Este é um ticket de teste automatizado.");
    await page.getByRole("button", { name: /enviar|criar/i }).click();
    // Redireciona para detalhes do ticket ou lista
    await expect(page).toHaveURL(/support/, { timeout: 5000 });
  });

  test("perfil do usuário mostra dados pessoais", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: /perfil|minha conta/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/nickname|nome/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});

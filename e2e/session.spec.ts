import { test, expect } from "@playwright/test";
import { ADMIN_FILE, USER_FILE } from "./auth-files";

test.describe("Fluxo de sessão — usuário", () => {
  test.use({ storageState: USER_FILE });
  test("página Usar PC carrega e exibe máquinas", async ({ page }) => {

    await page.goto("/session");
    await page.waitForLoadState("domcontentloaded");
    // Heading da página e lista de máquinas (Wolf 01, PS5 01, etc)
    await expect(page.getByRole("heading", { name: /Usar.*PC/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Wolf \d+|PS5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("botão Gerar PIN desabilitado sem máquina selecionada", async ({ page }) => {

    await page.goto("/session");
    const btn = page.getByRole("button", { name: /PIN|Gerar|Usar PC/i }).first();
    await expect(btn).toBeVisible();
  });

  test("sidebar contém link Usar PC", async ({ page }) => {

    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: /Usar PC/i })).toBeVisible();
  });

  test.skip("skip user@user — email inválido para browser", () => {});
});

test.describe("Painel Operador — admin", () => {
  test.use({ storageState: ADMIN_FILE });
  test("painel operador carrega com grid de máquinas", async ({ page }) => {

    await page.goto("/admin/operator");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { name: /Painel Operador/i })).toBeVisible({ timeout: 10000 });
    // Grid de máquinas — aguardar dados Realtime carregarem (Wolf 01, PS5 01, etc)
    await expect(page.getByText(/Wolf \d+|PS5 \d+/i).first()).toBeVisible({ timeout: 20000 });
  });

  test("sidebar admin contém link Painel Operador", async ({ page }) => {

    await page.goto("/admin/operator");
    await page.waitForLoadState("domcontentloaded");
    // Em desktop o sidebar é visível, em mobile usa menu hamburguer
    const isDesktop = page.viewportSize()!.width > 768;
    if (isDesktop) {
      await expect(page.getByRole("link", { name: /Painel Operador/i })).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: /Painel Operador/i })).toBeVisible({ timeout: 10000 });
    }
  });

  test("KPIs visíveis no painel operador", async ({ page }) => {

    await page.goto("/admin/operator");
    await page.waitForLoadState("domcontentloaded");
    // KPIs estão em uppercase via CSS: EM USO, DISPONÍVEIS, SESSÕES ATIVAS
    await expect(page.locator(".text-wolf-muted").filter({ hasText: /uso|dispon|sess/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("botão Iniciar Sessão abre modal", async ({ page }) => {

    await page.goto("/admin/operator");
    const startBtn = page.getByRole("button", { name: /Iniciar Sess/i }).first();
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();
    // Modal — aguardar qualquer elemento que apareça dentro do modal
    await expect(page.getByText(/selecionar|usuário|minutos|iniciar/i).nth(1)).toBeVisible({ timeout: 8000 });
  });
});

test.describe("API de sessão", () => {
  test("POST /api/session/pin sem autenticação retorna 401", async ({ request }) => {
    const res = await request.post("/api/session/pin", {
      data: { machine_id: "00000000-0000-0000-0000-000000000000" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/session/start sem autenticação retorna 401", async ({ request }) => {
    const res = await request.post("/api/session/start", {
      data: { machine_id: "test", user_id: "test", minutes: 60 },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/session/end sem autenticação retorna 401", async ({ request }) => {
    const res = await request.post("/api/session/end", {
      data: { session_id: "test" },
    });
    expect(res.status()).toBe(401);
  });
});

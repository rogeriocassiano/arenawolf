import { test, expect, Page } from "@playwright/test";

async function loginAsUser(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL ?? "test@arenawolf.com");
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD ?? "test123456");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
}

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL ?? "admin@arenawolf.com");
  await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD ?? "admin123456");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin");
}

test.describe("Fluxo de sessão — usuário", () => {
  test("página Usar PC carrega e exibe máquinas", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/session");
    await expect(page.getByText("Usar um PC")).toBeVisible();
    await expect(page.getByText("Selecione uma máquina")).toBeVisible();
  });

  test("botão Gerar PIN desabilitado sem máquina selecionada", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/session");
    const btn = page.getByRole("button", { name: /Gerar PIN/i });
    await expect(btn).toBeDisabled();
  });

  test("sidebar contém link Usar PC", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: /Usar PC/i })).toBeVisible();
  });
});

test.describe("Painel Operador — admin", () => {
  test("painel operador carrega com grid de máquinas", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/operator");
    await expect(page.getByText("Painel Operador")).toBeVisible();
    await expect(page.getByText("Máquinas")).toBeVisible();
  });

  test("sidebar admin contém link Painel Operador", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin");
    await expect(page.getByRole("link", { name: /Painel Operador/i })).toBeVisible();
  });

  test("KPIs visíveis no painel operador", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/operator");
    await expect(page.getByText("Em uso")).toBeVisible();
    await expect(page.getByText("Disponíveis")).toBeVisible();
    await expect(page.getByText("Sessões Ativas")).toBeVisible();
    await expect(page.getByText("Tempo baixo")).toBeVisible();
  });

  test("botão Iniciar Sessão abre modal", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/operator");
    const startBtn = page.getByRole("button", { name: /Iniciar Sessão/i }).first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await expect(page.getByText("Iniciar Sessão")).toBeVisible();
      await expect(page.getByText("Selecionar usuário")).toBeVisible();
    }
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

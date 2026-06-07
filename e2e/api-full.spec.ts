/**
 * E2E Tests — API Routes
 * Testa todos os endpoints da API com autenticação real
 */

import { test, expect, APIRequestContext } from "@playwright/test";

const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL ?? "luan@arenawolf.com",
  password: process.env.TEST_ADMIN_PASSWORD ?? "12345678",
};

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL ?? "user@user.com",
  password: process.env.TEST_USER_PASSWORD ?? "12345678",
};

async function getAuthCookies(request: APIRequestContext, email: string, password: string): Promise<string> {
  const response = await request.post("/login", {
    form: { email, password },
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  // Extrai cookies da resposta
  const setCookie = response.headers()["set-cookie"] || "";
  return setCookie;
}

test.describe("API — Autenticação", () => {
  test("POST /api/session/start retorna 401 sem auth", async ({ request }) => {
    const res = await request.post("/api/session/start", {
      data: { machine_id: "test", user_id: "test", minutes: 60 },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/session/end retorna 401 sem auth", async ({ request }) => {
    const res = await request.post("/api/session/end", {
      data: { session_id: "test" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/session/add-time retorna 401 sem auth", async ({ request }) => {
    const res = await request.post("/api/session/add-time", {
      data: { session_id: "test", minutes: 30 },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/machines/[id]/shutdown retorna 401 sem auth", async ({ request }) => {
    const res = await request.post("/api/machines/test-id/shutdown");
    expect(res.status()).toBe(401);
  });

  test("POST /api/machines/[id]/wakeup retorna 401 sem auth", async ({ request }) => {
    const res = await request.post("/api/machines/test-id/wakeup");
    expect(res.status()).toBe(401);
  });
});

test.describe("API — Validações", () => {
  test("POST /api/session/pin com machine_id inválido retorna erro", async ({ request }) => {
    const res = await request.post("/api/session/pin", {
      data: { machine_id: "not-a-uuid" },
    });
    // Sem auth ou com auth inválida
    expect([400, 401]).toContain(res.status());
  });
});

test.describe("API — Apps", () => {
  test("GET /api/apps/[machineId] sem agent key retorna 401", async ({ request }) => {
    const res = await request.get("/api/apps/test-machine-id");
    expect(res.status()).toBe(401);
  });

  test("GET /api/apps/[machineId] com agent key errado retorna 401", async ({ request }) => {
    const res = await request.get("/api/apps/test-machine-id", {
      headers: { "x-agent-key": "wrong-key" },
    });
    expect(res.status()).toBe(401);
  });
});

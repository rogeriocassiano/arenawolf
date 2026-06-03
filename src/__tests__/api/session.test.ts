/**
 * Testes unitários — API routes de sessão
 * Valida autenticação, validação de params e lógica de negócio.
 * @jest-environment node
 */

import { NextRequest } from "next/server";

// ─── Mocks compartilhados ────────────────────────────────────────────────────

const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
      rpc: mockRpc,
    })
  ),
  createAdminClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
      rpc: mockRpc,
    })
  ),
}));

const makeRequest = (body: object, headers: Record<string, string> = {}) =>
  new NextRequest("http://localhost/api/session/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

// ─── /api/session/start ──────────────────────────────────────────────────────

describe("POST /api/session/start", () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import("@/app/api/session/start/route"));
  });

  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when no auth", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 60 });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin/staff", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "user" } }) }) }),
    }));
    const req = makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 60 });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 when minutes out of range (>480)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
    }));
    // minutes=1000 > 480 → deve retornar 400 antes de consultar a máquina
    const req = makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 1000 });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/480/);
  });

  it("returns 400 when minutes is zero", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
    }));
    const req = makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 0 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when machine not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
      };
      if (table === "machines") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      };
      return {};
    });
    const req = makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 60 });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});

// ─── /api/session/end ────────────────────────────────────────────────────────

describe("POST /api/session/end", () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import("@/app/api/session/end/route"));
  });

  beforeEach(() => jest.clearAllMocks());

  it("returns 401 without agent key or auth", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = new NextRequest("http://localhost/api/session/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: "s-1" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when session_id is missing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
    }));
    const req = new NextRequest("http://localhost/api/session/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ─── /api/session/add-time ────────────────────────────────────────────────────

describe("POST /api/session/add-time", () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import("@/app/api/session/add-time/route"));
  });

  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = new NextRequest("http://localhost/api/session/add-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: "s-1", minutes: 30 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin/staff", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "user" } }) }) }),
    }));
    const req = new NextRequest("http://localhost/api/session/add-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: "s-1", minutes: 30 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});

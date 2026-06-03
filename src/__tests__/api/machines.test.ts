/**
 * Testes unitários — API routes de máquinas (shutdown, wakeup, apps)
 * @jest-environment node
 */

import { NextRequest } from "next/server";

const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
  createAdminClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}));

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });
const makeRequest = (url: string) =>
  new NextRequest(url, { method: "POST", headers: { "Content-Type": "application/json" } });

// ─── /api/machines/[id]/shutdown ─────────────────────────────────────────────

describe("POST /api/machines/[id]/shutdown", () => {
  let POST: (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import("@/app/api/machines/[id]/shutdown/route"));
  });

  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest("http://localhost"), makeParams("m-1"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when caller is not admin/staff", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "user" } }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }));
    const res = await POST(makeRequest("http://localhost"), makeParams("m-1"));
    expect(res.status).toBe(403);
  });

  it("returns 200 when admin sends shutdown command", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }));
    const res = await POST(makeRequest("http://localhost"), makeParams("m-1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});

// ─── /api/machines/[id]/wakeup ───────────────────────────────────────────────

describe("POST /api/machines/[id]/wakeup", () => {
  let POST: (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import("@/app/api/machines/[id]/wakeup/route"));
  });

  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest("http://localhost"), makeParams("m-1"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when caller is not admin/staff", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "user" } }) }) }),
    }));
    const res = await POST(makeRequest("http://localhost"), makeParams("m-1"));
    expect(res.status).toBe(403);
  });

  it("returns 404 when machine not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
      };
      return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      };
    });
    const res = await POST(makeRequest("http://localhost"), makeParams("m-1"));
    expect(res.status).toBe(404);
  });

  it("returns 400 when machine has no mac_address", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
      };
      return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { name: "Wolf 01", mac_address: null } }) }) }),
      };
    });
    const res = await POST(makeRequest("http://localhost"), makeParams("m-1"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/MAC/i);
  });
});

// ─── /api/apps/[machineId] ───────────────────────────────────────────────────

describe("GET /api/apps/[machineId]", () => {
  let GET: (req: NextRequest, ctx: { params: Promise<{ machineId: string }> }) => Promise<Response>;

  beforeAll(async () => {
    ({ GET } = await import("@/app/api/apps/[machineId]/route"));
  });

  beforeEach(() => jest.clearAllMocks());

  it("returns 401 without agent key or auth", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = new NextRequest("http://localhost/api/apps/m-1");
    const res = await GET(req, { params: Promise.resolve({ machineId: "m-1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 401 with wrong agent key", async () => {
    const req = new NextRequest("http://localhost/api/apps/m-1", {
      headers: { "x-agent-key": "wrong-key" },
    });
    const res = await GET(req, { params: Promise.resolve({ machineId: "m-1" }) });
    expect(res.status).toBe(401);
  });

  it("returns apps list when authenticated user calls", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) }),
    }));

    // Mock fallback: sem machineApps → retorna todos os apps ativos
    const mockAllApps = { data: [{ id: "app-1", name: "Steam" }] };
    mockFrom.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
      }),
    })).mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({ order: () => Promise.resolve(mockAllApps) }),
      }),
    }));

    const req = new NextRequest("http://localhost/api/apps/m-1");
    const res = await GET(req, { params: Promise.resolve({ machineId: "m-1" }) });
    expect(res.status).toBe(200);
  });
});

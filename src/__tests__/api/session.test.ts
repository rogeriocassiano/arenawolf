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

  it("validates bearer tokens and allows a user to reach validation for their own session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { role: "user", banned: false } }) }) }),
    }));
    const res = await POST(makeRequest({ user_id: "u-1" }, { Authorization: "Bearer valid-token" }));
    expect(mockGetUser).toHaveBeenCalledWith("valid-token");
    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("rejects bearer users targeting another account", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { role: "user", banned: false } }) }) }),
    }));
    const res = await POST(makeRequest({ machine_id: "m-1", user_id: "u-2", minutes: 60 }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(403);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("rejects invalid bearer tokens", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "invalid" } });
    const res = await POST(makeRequest({}, { Authorization: "Bearer invalid-token" }));
    expect(res.status).toBe(401);
    expect(mockRpc).not.toHaveBeenCalled();
  });

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

  function mockSessionState(session: Record<string, unknown> | null, status = "busy", error: object | null = null) {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    mockFrom.mockImplementation((table: string) => {
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        maybeSingle: async () => ({ data: session, error }),
        single: async () => ({ data: table === "machines"
          ? { id: "m-1", name: "Wolf 09", status }
          : table === "profiles"
            ? { role: "user", banned: false, nickname: "Teste", credits_minutes: 120 }
            : session, error: null }),
      };
      return query;
    });
  }

  it("resumes the same user's active session after reboot without starting another", async () => {
    const endsAt = new Date(Date.now() + 3600000).toISOString();
    mockSessionState({ id: "existing-session", user_id: "u-1", ends_at: endsAt });
    const res = await POST(makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 120 }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ session_id: "existing-session", ends_at: endsAt, resumed: true });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("does not resume a session owned by someone else", async () => {
    mockSessionState({ id: "other-session", user_id: "u-2", ends_at: new Date(Date.now() + 3600000).toISOString() });
    const res = await POST(makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 60 }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(409);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("does not reactivate an expired session or extend its original time", async () => {
    mockSessionState({ id: "expired-session", user_id: "u-1", ends_at: new Date(Date.now() - 60000).toISOString() });
    const res = await POST(makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 60 }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/expirou/);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("fails closed if the active-session lookup fails", async () => {
    mockSessionState(null, "busy", { message: "database unavailable" });
    const res = await POST(makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 60 }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(500);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("never creates a session for a resume-only request on a free machine", async () => {
    mockSessionState(null, "free");
    const res = await POST(makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 60, resume_only: true }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(409);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("still starts a new session on a free machine", async () => {
    const endsAt = new Date(Date.now() + 3600000).toISOString();
    mockSessionState({ ends_at: endsAt }, "free");
    mockRpc.mockResolvedValue({ data: "new-session", error: null });
    const res = await POST(makeRequest({ machine_id: "m-1", user_id: "u-1", minutes: 60 }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith("start_session", { p_machine_id: "m-1", p_user_id: "u-1", p_minutes: 60 });
    expect(await res.json()).toMatchObject({ session_id: "new-session", ends_at: endsAt });
  });

  it("starts the full balance flow through the atomic agent RPC", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    mockFrom.mockImplementation(() => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role: "user", banned: false } }) }) }) }));
    mockRpc.mockResolvedValue({ data: { session_id: "new", credits_minutes: 3586, ends_at: "2026-12-01T00:00:00Z" }, error: null });
    const machine = "00000000-0000-4000-8000-000000000003";
    const instance = "00000000-0000-4000-8000-000000000004";
    const res = await POST(makeRequest({ machine_id: machine, user_id: "u-1", use_balance: true, instance_id: instance }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith("start_agent_session", { p_machine_id: machine, p_user_id: "u-1", p_instance_id: instance, p_resume_only: false });
    expect((await res.json()).credits_minutes).toBe(3586);
  });

  it("rejects a full-balance request without a valid agent instance", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    mockFrom.mockImplementation(() => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role: "user", banned: false } }) }) }) }));
    const res = await POST(makeRequest({ machine_id: "invalid", user_id: "u-1", use_balance: true }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
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

  it("accepts a verified bearer token for ending the user's own session without an agent key", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    mockFrom.mockImplementation((table: string) => ({ select: () => ({ eq: () => ({ single: async () => ({ data: table === "profiles" ? { role: "user" } : { user_id: "u-1" } }) }) }) }));
    mockRpc.mockResolvedValue({ error: null });
    const res = await POST(makeRequest({ session_id: "s-1", ended_by: "user" }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(200);
    expect(mockGetUser).toHaveBeenCalledWith("valid-token");
    expect(mockRpc).toHaveBeenCalledWith("end_session", { p_session_id: "s-1", p_ended_by: "user" });
  });

  it("does not let a bearer token end another person's session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    mockFrom.mockImplementation((table: string) => ({ select: () => ({ eq: () => ({ single: async () => ({ data: table === "profiles" ? { role: "admin" } : { user_id: "u-2" } }) }) }) }));
    const res = await POST(makeRequest({ session_id: "s-2" }, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(403);
    expect(mockRpc).not.toHaveBeenCalled();
  });

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

describe("POST /api/session/heartbeat", () => {
  let POST: (req: NextRequest) => Promise<Response>;
  const machine = "00000000-0000-4000-8000-000000000003";
  const session = "00000000-0000-4000-8000-000000000006";
  const instance = "00000000-0000-4000-8000-000000000004";
  const body = { session_id: session, machine_id: machine, instance_id: instance };
  beforeAll(async () => { ({ POST } = await import("@/app/api/session/heartbeat/route")); });
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    mockFrom.mockImplementation(() => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { user_id: "u-1" } }) }) }) }));
  });

  it("requires authentication before recording a heartbeat", async () => {
    expect((await POST(makeRequest(body))).status).toBe(401);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("confirms only an authenticated owner's session", async () => {
    mockRpc.mockResolvedValue({ data: { active: true, credits_minutes: 227, ends_at: "2026-12-01T00:00:00Z" }, error: null });
    const res = await POST(makeRequest(body, { Authorization: "Bearer valid-token" }));
    expect(res.status).toBe(200);
    expect(mockGetUser).toHaveBeenCalledWith("valid-token");
    expect(mockRpc).toHaveBeenCalledWith("agent_session_heartbeat", { p_session_id: session, p_machine_id: machine, p_instance_id: instance });
  });

  it("cannot confirm another user's session", async () => {
    mockFrom.mockImplementation(() => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { user_id: "u-2" } }) }) }) }));
    expect((await POST(makeRequest(body, { Authorization: "Bearer valid-token" }))).status).toBe(403);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("rejects malformed identities without calling the billing RPC", async () => {
    expect((await POST(makeRequest({ ...body, instance_id: "invalid" }, { Authorization: "Bearer valid-token" }))).status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("does not claim success when database confirmation fails", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "unavailable" } });
    expect((await POST(makeRequest(body, { Authorization: "Bearer valid-token" }))).status).toBe(500);
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

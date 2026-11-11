import { getRemainingSeconds } from "../session";

const mockSignIn = jest.fn();
const mockGetSession = jest.fn();
const mockProfileRead = jest.fn();

// Mock config
jest.mock("../config", () => ({
  getConfig: () => ({
    machineId: "test-machine-id",
    supabaseUrl: "https://test.supabase.co",
    supabaseKey: "test-key",
    apiBaseUrl: "http://localhost:3000",
    agentKey: "test-agent-key",
  }),
}));

// Mock supabase
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignIn, getSession: mockGetSession },
    from: () => ({ select: () => ({ eq: () => ({ single: mockProfileRead }) }) }),
    channel: () => ({
      on: () => ({ subscribe: jest.fn() }),
    }),
    removeChannel: jest.fn(),
  }),
}));

describe("session", () => {
  it("getRemainingSeconds returns 0 when no session", () => {
    expect(getRemainingSeconds()).toBe(0);
  });

  it("validatePin calls fetch with correct body", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        session_id: "sess-123",
        user_id: "user-123",
        nickname: "GamerPro",
        credits_minutes: 120,
        ends_at: new Date(Date.now() + 7200000).toISOString(),
      }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const { validatePin } = await import("../session");
    const result = await validatePin("123456");

    expect(result.ok).toBe(true);
    expect(result.session?.nickname).toBe("GamerPro");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/session/pin"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("validatePin returns error on API failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "PIN inválido ou expirado" }),
    }) as unknown as typeof fetch;

    const { validatePin } = await import("../session");
    const result = await validatePin("000000");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("PIN inválido ou expirado");
  });

  async function seedSession() {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ session_id: "end-test", user_id: "user-123", nickname: "Teste", credits_minutes: 60, ends_at: new Date(Date.now() + 3600000).toISOString() }) }) as unknown as typeof fetch;
    const { validatePin } = await import("../session");
    await validatePin("123456");
  }

  it.each([401, 500])("preserves the session on server error %s and allows retry", async status => {
    await seedSession();
    const { endCurrentSession, getCurrentSession } = await import("../session");
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status, json: async () => ({ error: "Encerramento recusado" }) }) as unknown as typeof fetch;
    expect(await endCurrentSession("user")).toEqual({ ok: false, error: "Encerramento recusado" });
    expect(getCurrentSession()?.sessionId).toBe("end-test");
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }) as unknown as typeof fetch;
    expect(await endCurrentSession("user")).toEqual({ ok: true });
    expect(getCurrentSession()).toBeNull();
  });

  it("keeps the session on network failure instead of pretending it ended", async () => {
    await seedSession();
    const { endCurrentSession, getCurrentSession } = await import("../session");
    global.fetch = jest.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
    expect((await endCurrentSession("user")).ok).toBe(false);
    expect(getCurrentSession()?.sessionId).toBe("end-test");
  });

  it("uses the authoritative full balance and a refreshed bearer token to end the session", async () => {
    mockSignIn.mockResolvedValue({ data: { user: { id: "user-123" }, session: { access_token: "initial-token" } }, error: null });
    mockProfileRead.mockResolvedValue({ data: { nickname: "Teste", credits_minutes: 600, banned: false } });
    mockGetSession.mockResolvedValue({ data: { session: { access_token: "refreshed-token" } } });
    const mockFetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ session_id: "full-balance", credits_minutes: 587, ends_at: new Date(Date.now() + 587 * 60000).toISOString() }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    global.fetch = mockFetch as unknown as typeof fetch;
    const { loginWithCredentials, endCurrentSession } = await import("../session");
    const result = await loginWithCredentials("test@example.com", "test-password");
    expect(result.session?.creditsMinutes).toBe(587);
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({ use_balance: true, instance_id: expect.any(String) });
    expect(await endCurrentSession("user")).toEqual({ ok: true });
    expect(mockFetch.mock.calls[1][1].headers.Authorization).toBe("Bearer refreshed-token");
  });

  it("updates the wallet from a heartbeat and respects server-side session closure", async () => {
    await seedSession();
    const { confirmSessionHeartbeat, getCurrentSession } = await import("../session");
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ active: true, credits_minutes: 47, ends_at: new Date(Date.now() + 47 * 60000).toISOString() }) }) as unknown as typeof fetch;
    expect(await confirmSessionHeartbeat()).toEqual({ ok: true });
    expect(getCurrentSession()?.creditsMinutes).toBe(47);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ active: false }) }) as unknown as typeof fetch;
    expect(await confirmSessionHeartbeat()).toEqual({ ok: true, ended: true });
    expect(getCurrentSession()).toBeNull();
  });

  it("does not mistake a failed heartbeat for a confirmed end", async () => {
    await seedSession();
    const { confirmSessionHeartbeat, getCurrentSession } = await import("../session");
    global.fetch = jest.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
    expect(await confirmSessionHeartbeat()).toEqual({ ok: false });
    expect(getCurrentSession()?.sessionId).toBe("end-test");
  });

  it("validatePin handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error")) as unknown as typeof fetch;
    const { validatePin } = await import("../session");
    const result = await validatePin("123456");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("conexão");
  });
});

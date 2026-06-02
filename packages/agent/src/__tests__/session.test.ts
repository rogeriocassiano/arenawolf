import { getRemainingSeconds } from "../session";

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

  it("validatePin handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error")) as unknown as typeof fetch;
    const { validatePin } = await import("../session");
    const result = await validatePin("123456");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("conexão");
  });
});

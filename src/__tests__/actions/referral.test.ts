/**
 * Testes unitários — Programa de Indicação
 */

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

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { getOrCreateReferralCode, processReferral, creditReferralReward, getUserReferrals } from "@/app/actions/referral";

describe("getOrCreateReferralCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await getOrCreateReferralCode();
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns existing code when user already has one", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { referral_code: "ABC123", total_referrals: 5 } }),
        }),
      }),
    }));

    const result = await getOrCreateReferralCode();
    expect(result.code).toBe("ABC123");
    expect(result.totalReferrals).toBe(5);
    expect(result.referralLink).toContain("ABC123");
  });

  it("generates new code when user has none", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { referral_code: null, total_referrals: 0 } }),
            }),
          }),
          update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }),
        };
      }
      return {};
    });

    const result = await getOrCreateReferralCode();
    expect(result.code).toBeDefined();
    expect(result.code).toHaveLength(6);
    expect(result.totalReferrals).toBe(0);
  });
});

describe("processReferral", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error for invalid referral code", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null }),
        }),
      }),
    }));

    const result = await processReferral("user-2", "INVALID");
    expect(result.error).toMatch(/inválido/i);
  });

  it("returns error when user tries to refer themselves", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { id: "user-1", referral_code: "ABC123" } }),
        }),
      }),
    }));

    const result = await processReferral("user-1", "ABC123");
    expect(result.error).toMatch(/próprio código/i);
  });

  it("returns error when user was already referred", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { id: "user-1", referral_code: "ABC123" } }),
            }),
          }),
        };
      }
      if (table === "referral_rewards") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { id: "reward-1" } }),
            }),
          }),
        };
      }
      return {};
    });

    const result = await processReferral("user-2", "ABC123");
    expect(result.error).toMatch(/já foi indicado/i);
  });

  it("creates pending reward and gives bonus to referred user", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { id: "user-1", referral_code: "ABC123" } }),
            }),
          }),
          update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }),
        };
      }
      if (table === "referral_rewards") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null }),
            }),
          }),
          insert: jest.fn().mockReturnValue({
            select: () => ({ single: () => Promise.resolve({ data: { id: "reward-1" } }) }),
          }),
        };
      }
      if (table === "credit_balances") {
        return { insert: jest.fn().mockResolvedValue({}) };
      }
      if (table === "transactions") {
        return { insert: jest.fn().mockResolvedValue({}) };
      }
      return {};
    });

    const result = await processReferral("user-2", "ABC123");
    expect(result.success).toBe(true);
  });
});

describe("creditReferralReward", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when no pending reward", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null }),
          }),
        }),
      }),
    }));

    const result = await creditReferralReward("user-2");
    expect(result.error).toMatch(/nenhuma recompensa/i);
  });

  it("credits referrer and updates status", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "referral_rewards") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { id: "reward-1", referrer_id: "user-1", reward_minutes: 60 },
                }),
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }),
        };
      }
      if (table === "credit_balances") {
        return { insert: jest.fn().mockResolvedValue({}) };
      }
      if (table === "transactions") {
        return { insert: jest.fn().mockResolvedValue({}) };
      }
      return {};
    });
    mockRpc.mockResolvedValue({});

    const result = await creditReferralReward("user-2");
    expect(result.success).toBe(true);
    expect(result.creditedMinutes).toBe(60);
  });
});

describe("getUserReferrals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await getUserReferrals();
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns list of referrals", async () => {
    const mockReferrals = [
      { id: "ref-1", referred: { nickname: "João" }, status: "credited", created_at: "2025-01-01" },
      { id: "ref-2", referred: { nickname: "Maria" }, status: "pending", created_at: "2025-01-02" },
    ];
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: mockReferrals }),
        }),
      }),
    }));

    const result = await getUserReferrals();
    expect(result.referrals).toHaveLength(2);
    expect(result.referrals?.[0].referred.nickname).toBe("João");
  });
});

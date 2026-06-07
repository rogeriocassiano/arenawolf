/**
 * Testes unitários — Credits (Dashboard de Créditos)
 */

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

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { getCreditsBalance, getCreditsHistory, transferCredits, findUserByNickname, consumeCredits } from "@/app/actions/credits";

describe("getCreditsBalance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await getCreditsBalance();
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns summary by type", async () => {
    const mockBalances = [
      { type: "paid", amount: 1000, expires_at: null },
      { type: "bonus", amount: 60, expires_at: new Date(Date.now() + 5 * 86400000).toISOString() },
      { type: "cashback", amount: 30, expires_at: new Date(Date.now() + 25 * 86400000).toISOString() },
      { type: "expired", amount: 20, expires_at: new Date(Date.now() - 86400000).toISOString() },
    ];
    mockFrom.mockImplementation((table: string) => {
      if (table === "credit_balances") {
        return {
          select: () => ({
            eq: () => ({
              gt: () => Promise.resolve({ data: mockBalances }),
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { credits_minutes: 1090 } }), // igual ao total dos balances
            }),
          }),
        };
      }
      return {};
    });

    const result = await getCreditsBalance();
    expect(result.summary!.paid).toBe(1000);
    expect(result.summary!.bonus).toBe(60);
    expect(result.summary!.cashback).toBe(30);
    expect(result.summary!.expiringSoon).toBeGreaterThan(0);
    expect(result.expiringItems).toBeDefined();
  });
});

describe("getCreditsHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns transaction history", async () => {
    const mockTransactions = [
      { id: "t1", type: "credit_add", amount: 60, description: "Compra", created_at: "2025-01-01" },
      { id: "t2", type: "credit_use", amount: -45, description: "Sessão", created_at: "2025-01-02" },
    ];
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: mockTransactions }),
          }),
        }),
      }),
    }));

    const result = await getCreditsHistory(50);
    expect(result.transactions).toHaveLength(2);
  });
});

describe("transferCredits", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await transferCredits("user-2", 60);
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error for invalid amount", async () => {
    const result = await transferCredits("user-2", 0);
    expect(result.error).toMatch(/inválida/i);
  });

  it("returns error when transferring to self", async () => {
    const result = await transferCredits("user-1", 60);
    expect(result.error).toMatch(/si mesmo/i);
  });

  it("returns error when insufficient credits", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { credits_minutes: 30, nickname: "Remetente" } }),
            }),
          }),
        };
      }
      return {};
    });

    const result = await transferCredits("user-2", 60);
    expect(result.error).toMatch(/insuficientes/i);
  });

  it("transfers credits with 5% fee", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { credits_minutes: 200, nickname: "Remetente" },
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }),
        };
      }
      if (table === "transactions") {
        return { insert: jest.fn().mockResolvedValue({}) };
      }
      return {};
    });

    const result = await transferCredits("user-2", 100);
    expect(result.success).toBe(true);
    expect(result.transferred).toBe(95); // 100 - 5% = 95
    expect(result.fee).toBe(5);
  });
});

describe("findUserByNickname", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns users matching nickname", async () => {
    const mockUsers = [
      { id: "user-2", nickname: "WolfPlayer", avatar_url: null },
      { id: "user-3", nickname: "Wolf_Gamer", avatar_url: null },
    ];
    mockFrom.mockImplementation(() => ({
      select: () => ({
        ilike: () => ({
          limit: () => Promise.resolve({ data: mockUsers }),
        }),
      }),
    }));

    const result = await findUserByNickname("wolf");
    expect(result.users).toHaveLength(2);
  });

  it("excludes current user from results", async () => {
    const mockUsers = [
      { id: "user-1", nickname: "Me" },
      { id: "user-2", nickname: "Other" },
    ];
    mockFrom.mockImplementation(() => ({
      select: () => ({
        ilike: () => ({
          limit: () => Promise.resolve({ data: mockUsers }),
        }),
      }),
    }));

    const result = await findUserByNickname("");
    expect(result.users?.some((u) => u.id === "user-1")).toBe(false);
  });
});

describe("consumeCredits", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await consumeCredits(60, "Test");
    expect(result.error).toMatch(/autenticado/i);
  });

  it("consumes credits from balances in FIFO order", async () => {
    const mockBalances = [
      { id: "b1", amount: 30, expires_at: new Date(Date.now() + 1 * 86400000).toISOString(), type: "bonus" },
      { id: "b2", amount: 100, expires_at: null, type: "paid" },
    ];
    mockFrom.mockImplementation((table: string) => {
      if (table === "credit_balances") {
        return {
          select: () => ({
            eq: () => ({
              gt: () => ({
                order: () => Promise.resolve({ data: mockBalances }),
              }),
            }),
          }),
          delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }),
          update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }),
        };
      }
      if (table === "transactions") {
        return { insert: jest.fn().mockResolvedValue({}) };
      }
      return {};
    });

    const result = await consumeCredits(50, "Sessão");
    expect(result.success).toBe(true);
    expect(result.consumedFrom).toBeDefined();
  });

  it("returns error when insufficient credits", async () => {
    const mockBalances = [
      { id: "b1", amount: 20, expires_at: null, type: "bonus" },
    ];
    mockFrom.mockImplementation((table: string) => {
      if (table === "credit_balances") {
        return {
          select: () => ({
            eq: () => ({
              gt: () => ({
                order: () => Promise.resolve({ data: mockBalances }),
              }),
            }),
          }),
          delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }),
          update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }),
        };
      }
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { credits_minutes: 0 } }),
            }),
          }),
        };
      }
      return {};
    });

    const result = await consumeCredits(100, "Sessão");
    expect(result.error).toMatch(/insuficientes/i);
  });
});

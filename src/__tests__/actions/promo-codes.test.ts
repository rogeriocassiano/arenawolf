/**
 * Testes unitários — Promo Codes / Gift Cards
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

import { createPromoCode, redeemPromoCode, listPromoCodes, togglePromoCode } from "@/app/actions/promo-codes";

describe("createPromoCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
        };
      }
      return {
        insert: jest.fn().mockReturnValue({ select: () => ({ single: () => Promise.resolve({ data: { id: "code-1" } }) }) }),
      };
    });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(createPromoCode({
      code: "WOLF50",
      type: "fixed",
      value: 60,
      maxUses: 100,
    })).rejects.toThrow(/autenticado/i);
  });

  it("returns error when user is not admin", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "user" } }) }) }),
    }));
    const result = await createPromoCode({
      code: "WOLF50",
      type: "fixed",
      value: 60,
      maxUses: 100,
    });
    expect(result.error).toMatch(/permissão/i);
  });

  it("returns error for invalid code format", async () => {
    const result = await createPromoCode({
      code: "wolf 50!", // espaço e exclamação não permitidos
      type: "fixed",
      value: 60,
      maxUses: 100,
    });
    expect(result.error).toBeTruthy();
  });

  it("returns error for code too short", async () => {
    const result = await createPromoCode({
      code: "W",
      type: "fixed",
      value: 60,
      maxUses: 100,
    });
    expect(result.error).toBeTruthy();
  });

  it("returns success for valid promo code", async () => {
    const result = await createPromoCode({
      code: "WOLF50",
      description: "Promoção de lançamento",
      type: "fixed",
      value: 60,
      maxUses: 100,
      validDays: 30,
    });
    expect(result.success).toBe(true);
    expect(result.promoCode).toBeDefined();
  });

  it("converts code to uppercase", async () => {
    const insertMock = jest.fn().mockReturnValue({
      select: () => ({ single: () => Promise.resolve({ data: { id: "code-1", code: "WOLF50" } }) }),
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }) };
      }
      return { insert: insertMock };
    });

    await createPromoCode({
      code: "wolf50", // lowercase
      type: "fixed",
      value: 60,
      maxUses: 100,
    });

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      code: "WOLF50", // uppercase
    }));
  });
});

describe("redeemPromoCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await redeemPromoCode("WOLF50");
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error for invalid code", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
    }));
    const result = await redeemPromoCode("INVALID");
    expect(result.error).toMatch(/inválido/i);
  });

  it("returns error when code max uses reached", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "promo_codes") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { id: "code-1", code: "WOLF50", max_uses: 10, uses_count: 10, value: 60, type: "fixed", active: true, valid_from: "2024-01-01" },
              }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) };
    });
    const result = await redeemPromoCode("WOLF50");
    expect(result.error).toMatch(/esgotado/i);
  });

  it("returns error when user already used code", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "promo_codes") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { id: "code-1", code: "WOLF50", max_uses: 100, uses_count: 5, value: 60, type: "fixed", active: true, valid_from: "2024-01-01" },
              }),
            }),
          }),
        };
      }
      if (table === "promo_code_uses") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: { id: "use-1" } }),
              }),
            }),
          }),
        };
      }
      return { insert: jest.fn().mockResolvedValue({}) };
    });
    const result = await redeemPromoCode("WOLF50");
    expect(result.error).toMatch(/já resgatou/i);
  });

  it("returns success and credits for valid code", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "promo_codes") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { id: "code-1", code: "WOLF50", max_uses: 100, uses_count: 5, value: 60, type: "fixed", active: true, valid_from: "2024-01-01" },
              }),
            }),
          }),
        };
      }
      if (table === "promo_code_uses") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: null }),
              }),
            }),
          }),
          insert: jest.fn().mockResolvedValue({}),
        };
      }
      if (table === "credit_balances") {
        return { insert: jest.fn().mockResolvedValue({}) };
      }
      if (table === "transactions") {
        return { insert: jest.fn().mockResolvedValue({}) };
      }
      return { update: jest.fn().mockResolvedValue({}) };
    });

    const result = await redeemPromoCode("WOLF50");
    expect(result.success).toBe(true);
    expect(result.creditsAdded).toBe(60);
  });
});

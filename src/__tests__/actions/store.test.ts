/**
 * Testes unitários — actions/store.ts
 * Valida lógica de solicitação de pacotes de crédito e compra de produtos.
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

import { purchaseCreditPackage, purchaseProduct } from "@/app/actions/store";

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockProfileSelect = (credits = 200) => ({
  select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { credits_minutes: credits, nickname: "Wolf" } }) }) }),
});
const mockTransactionsInsert = () => ({
  insert: mockInsert,
});

// ─── purchaseCreditPackage ───────────────────────────────────────────────────

describe("purchaseCreditPackage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await purchaseCreditPackage("1h");
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error for invalid package id", async () => {
    mockFrom.mockImplementation(() => mockProfileSelect());
    const result = await purchaseCreditPackage("99h");
    expect(result.error).toMatch(/inválido/i);
  });

  it("returns error when profile not found", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      insert: mockInsert,
    }));
    const result = await purchaseCreditPackage("1h");
    expect(result.error).toMatch(/perfil/i);
  });

  it("returns success for valid package '1h'", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return mockProfileSelect();
      if (table === "transactions") return mockTransactionsInsert();
      return {};
    });
    const result = await purchaseCreditPackage("1h");
    expect(result.error).toBeUndefined();
    expect((result as { requested?: number }).requested).toBe(60);
  });

  it("returns success for package 'corujao' (480min)", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return mockProfileSelect();
      if (table === "transactions") return mockTransactionsInsert();
      return {};
    });
    const result = await purchaseCreditPackage("corujao");
    expect((result as { requested?: number }).requested).toBe(480);
  });

  it("returns success for package '10h' (600min)", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return mockProfileSelect();
      if (table === "transactions") return mockTransactionsInsert();
      return {};
    });
    const result = await purchaseCreditPackage("10h");
    expect((result as { requested?: number }).requested).toBe(600);
  });

  it("propagates transaction insert error", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return mockProfileSelect();
      if (table === "transactions") return { insert: jest.fn().mockResolvedValue({ error: { message: "DB error" } }) };
      return {};
    });
    const result = await purchaseCreditPackage("2h");
    expect(result.error).toBeTruthy();
  });
});

// ─── purchaseProduct ─────────────────────────────────────────────────────────

describe("purchaseProduct", () => {
  const mockProduct = { id: "prod-1", name: "Headset", price: 15.0, stock: 5, active: true };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await purchaseProduct("prod-1");
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error when product not found", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) }),
    }));
    const result = await purchaseProduct("prod-1");
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns error when product has no stock", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { ...mockProduct, stock: 0 } }) }) }) }),
    }));
    const result = await purchaseProduct("prod-1");
    expect(result.error).toMatch(/esgotado/i);
  });

  it("returns error when stock decrement fails (race condition)", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "products") {
        let calls = 0;
        return {
          select: () => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockProduct }) }) }) }),
          update: () => ({ eq: () => ({ gt: () => ({ select: () => Promise.resolve({ data: [], error: null }) }) }) }),
        };
      }
      return { insert: jest.fn().mockResolvedValue({ error: null }) };
    });
    const result = await purchaseProduct("prod-1");
    expect(result.error).toMatch(/esgotado/i);
  });

  it("returns success with product name and cashback on valid purchase", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "products") return {
        select: () => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockProduct }) }) }) }),
        update: () => ({ eq: () => ({ gt: () => ({ select: () => Promise.resolve({ data: [{ id: "prod-1" }], error: null }) }) }) }),
      };
      if (table === "transactions") return { 
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: () => ({ eq: () => ({ eq: () => Promise.resolve({ count: 1 }) }) }),
      };
      if (table === "credit_balances") return { insert: jest.fn().mockResolvedValue({ error: null }) };
      if (table === "profiles") return { 
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { referral_code: "ABC123" } }) }) }),
        update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }),
      };
      if (table === "referral_rewards") return { 
        select: () => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) }),
        insert: jest.fn().mockReturnValue({ select: () => ({ single: () => Promise.resolve({}) }) }),
      };
      return {};
    });
    const result = await purchaseProduct("prod-1");
    expect((result as { success?: boolean }).success).toBe(true);
    expect((result as { product?: string }).product).toBe("Headset");
    expect((result as { cashback?: number }).cashback).toBeDefined();
  });
});

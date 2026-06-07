/**
 * Testes unitários — Assinaturas
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

import { getSubscriptionPlans, getUserSubscription, addSubscriptionCredits, cancelSubscription } from "@/app/actions/subscriptions";

describe("getSubscriptionPlans", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns active plans ordered by price", async () => {
    const mockPlans = [
      { id: "basic", name: "Wolf Básico", monthly_price: 4990, credits_per_month: 1200 },
      { id: "gamer", name: "Wolf Gamer", monthly_price: 8990, credits_per_month: 2400 },
      { id: "pro", name: "Wolf Pro", monthly_price: 14990, credits_per_month: 4800 },
    ];
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: mockPlans }),
        }),
      }),
    }));

    const result = await getSubscriptionPlans();
    expect(result.plans).toHaveLength(3);
    expect(result.plans?.[0].monthly_price).toBe(4990);
  });
});

describe("getUserSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns null when no subscription", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null }),
          }),
        }),
      }),
    }));

    const result = await getUserSubscription();
    expect(result.subscription).toBeNull();
  });

  it("returns active subscription with plan details", async () => {
    const mockSub = {
      id: "sub-1",
      plan_id: "gamer",
      status: "active",
      credits_per_cycle: 2400,
      plan: { name: "Wolf Gamer", monthly_price: 8990 },
    };
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: mockSub }),
          }),
        }),
      }),
    }));

    const result = await getUserSubscription();
    expect(result.subscription).toBeDefined();
    expect(result.subscription?.plan.name).toBe("Wolf Gamer");
  });
});

describe("addSubscriptionCredits", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adds credits when subscription exists", async () => {
    const mockSub = {
      id: "sub-1",
      user_id: "user-1",
      plan_id: "gamer",
      credits_per_cycle: 2400,
      plan: { name: "Wolf Gamer" },
    };
    mockFrom.mockImplementation((table: string) => {
      if (table === "subscriptions") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockSub }),
              }),
            }),
          }),
          update: jest.fn().mockResolvedValue({}),
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

    const result = await addSubscriptionCredits("sub-1");
    expect(result.success).toBe(true);
    expect(result.creditsAdded).toBe(2400);
  });

  it("returns error when subscription not found", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null }),
          }),
        }),
      }),
    }));

    const result = await addSubscriptionCredits("invalid-id");
    expect(result.error).toMatch(/não encontrada/i);
  });
});

describe("cancelSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await cancelSubscription();
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error when no active subscription", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null }),
          }),
        }),
      }),
    }));
    const result = await cancelSubscription();
    expect(result.error).toMatch(/nenhuma assinatura/i);
  });

  it("cancels active subscription", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "subscriptions") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: { stripe_subscription_id: "stripe-123" } }),
              }),
            }),
          }),
          update: jest.fn().mockResolvedValue({}),
        };
      }
      return {};
    });

    const result = await cancelSubscription();
    expect(result.success).toBe(true);
  });
});

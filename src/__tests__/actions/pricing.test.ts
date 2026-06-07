/**
 * Testes unitários — Preço Dinâmico
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

import { getCurrentPricingMultiplier, calculatePrice, listPricingRules, savePricingRule, togglePricingRule } from "@/app/actions/pricing";

describe("getCurrentPricingMultiplier", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 1.0 when no rules match", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [] }),
        }),
      }),
    }));

    const result = await getCurrentPricingMultiplier();
    expect(result).toBe(1.0);
  });

  it("applies discount during morning hours", async () => {
    // Mock 10:00 (within 06:00-12:00 rule)
    jest.setSystemTime(new Date("2025-06-07T10:00:00"));

    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [
              { id: "1", name: "Manhã OFF", day_of_week: null, start_time: "06:00", end_time: "12:00", multiplier: 0.80, priority: 9, active: true },
            ],
          }),
        }),
      }),
    }));

    const result = await getCurrentPricingMultiplier();
    expect(result).toBe(0.80);
  });

  it("applies Sunday discount on Sunday", async () => {
    // Mock Sunday at 15:00
    jest.setSystemTime(new Date("2025-06-08T15:00:00")); // Sunday

    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [
              { id: "1", name: "Domingo OFF", day_of_week: 0, start_time: null, end_time: null, multiplier: 0.60, priority: 8, active: true },
            ],
          }),
        }),
      }),
    }));

    const result = await getCurrentPricingMultiplier();
    expect(result).toBe(0.60);
  });

  it("returns normal price during night hours", async () => {
    // Mock 20:00 (within 19:00-23:59 rule with multiplier 1.0)
    jest.setSystemTime(new Date("2025-06-07T20:00:00"));

    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [
              { id: "1", name: "Noite Normal", day_of_week: null, start_time: "19:00", end_time: "23:59", multiplier: 1.00, priority: 5, active: true },
            ],
          }),
        }),
      }),
    }));

    const result = await getCurrentPricingMultiplier();
    expect(result).toBe(1.0);
  });
});

describe("calculatePrice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calculates discounted price correctly", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "dynamic_pricing_rules") {
        const mockChain = {
          or: () => mockChain,
          lte: () => mockChain,
          gt: () => mockChain,
          order: () => mockChain,
          limit: () => mockChain,
          single: () => Promise.resolve({ data: { name: "Manhã OFF" } }),
        };
        return {
          select: () => ({
            eq: () => mockChain,
          }),
        };
      }
      return {};
    });

    const result = await calculatePrice(1000); // R$ 10,00
    expect(result.originalPrice).toBe(1000);
    expect(result.discountedPrice).toBeDefined();
    expect(result.multiplier).toBeDefined();
  });

  it("returns null label when no discount", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "dynamic_pricing_rules") {
        const mockChain = {
          or: () => mockChain,
          lte: () => mockChain,
          gt: () => mockChain,
          order: () => mockChain,
          limit: () => mockChain,
          single: () => Promise.resolve({ data: null }),
        };
        return {
          select: () => ({
            eq: () => mockChain,
          }),
        };
      }
      return {};
    });

    const result = await calculatePrice(1000);
    expect(result.label).toBeNull();
    expect(result.discountPercentage).toBe(0);
  });
});

describe("listPricingRules", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
  });

  it("returns error when not admin", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: "user" } }),
        }),
      }),
    }));

    const result = await listPricingRules();
    expect(result.error).toMatch(/permissão/i);
  });

  it("returns rules for admin", async () => {
    const mockRules = [
      { id: "1", name: "Manhã OFF", multiplier: 0.80, active: true },
      { id: "2", name: "Domingo OFF", multiplier: 0.60, active: true },
    ];
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { role: "admin" } }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          order: () => Promise.resolve({ data: mockRules }),
        }),
      };
    });

    const result = await listPricingRules();
    expect(result.rules).toHaveLength(2);
  });
});

describe("savePricingRule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
  });

  it("creates new rule", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { role: "admin" } }),
            }),
          }),
        };
      }
      return { insert: jest.fn().mockResolvedValue({}) };
    });

    const result = await savePricingRule({
      name: "Noite Promo",
      day_of_week: null,
      start_time: "00:00",
      end_time: "06:00",
      multiplier: 0.70,
      priority: 10,
      active: true,
    });
    expect(result.success).toBe(true);
  });

  it("updates existing rule", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { role: "admin" } }),
            }),
          }),
        };
      }
      return { update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }) };
    });

    const result = await savePricingRule({
      id: "rule-1",
      name: "Updated Rule",
      day_of_week: 1,
      start_time: "10:00",
      end_time: "14:00",
      multiplier: 0.75,
      priority: 5,
      active: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("togglePricingRule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
  });

  it("toggles rule active status", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { role: "admin" } }),
            }),
          }),
        };
      }
      return { update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({}) }) };
    });

    const result = await togglePricingRule("rule-1", false);
    expect(result.success).toBe(true);
  });
});

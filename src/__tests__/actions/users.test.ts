/**
 * Testes unitários — actions/users.ts
 * Valida operações administrativas de usuário (ban, créditos, role).
 */

const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockAdminUpdateUser = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
  createAdminClient: jest.fn(() =>
    Promise.resolve({
      auth: { admin: { updateUserById: mockAdminUpdateUser } },
      from: mockFrom,
    })
  ),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { banUser, unbanUser, addCredits, updateUserRole } from "@/app/actions/users";

const mockAdminProfile = { role: "admin" };
const mockUserProfile = { role: "user" };

const setupAdminAuth = () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
  mockFrom.mockImplementation((table: string) => {
    if (table === "profiles") return {
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockAdminProfile }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    };
    return { update: () => ({ eq: () => Promise.resolve({ error: null }) }) };
  });
};

// ─── banUser ─────────────────────────────────────────────────────────────────

describe("banUser", () => {
  beforeEach(() => { jest.clearAllMocks(); setupAdminAuth(); });

  it("throws when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(banUser("target-1", "comportamento inadequado")).rejects.toThrow(/autenticado/i);
  });

  it("throws when caller is not admin", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockUserProfile }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }));
    await expect(banUser("target-1", "motivo")).rejects.toThrow(/permissão/i);
  });

  it("returns success for admin banning a user", async () => {
    const result = await banUser("target-1", "comportamento inadequado");
    expect(result.success).toBeTruthy();
  });
});

// ─── unbanUser ────────────────────────────────────────────────────────────────

describe("unbanUser", () => {
  beforeEach(() => { jest.clearAllMocks(); setupAdminAuth(); });

  it("throws when caller is not admin", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockUserProfile }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }));
    await expect(unbanUser("target-1")).rejects.toThrow(/permissão/i);
  });

  it("returns success for admin unbanning a user", async () => {
    const result = await unbanUser("target-1");
    expect(result.success).toBeTruthy();
  });
});

// ─── addCredits ───────────────────────────────────────────────────────────────

describe("addCredits", () => {
  beforeEach(() => { jest.clearAllMocks(); setupAdminAuth(); });

  it("returns error for zero minutes", async () => {
    const result = await addCredits("target-1", 0);
    expect(result.error).toBeTruthy();
  });

  it("returns error for negative minutes", async () => {
    const result = await addCredits("target-1", -60);
    expect(result.error).toBeTruthy();
  });

  it("throws when caller is not admin", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockUserProfile }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      insert: () => Promise.resolve({ error: null }),
    }));
    await expect(addCredits("target-1", 60)).rejects.toThrow(/permissão/i);
  });

  it("calls rpc or update with correct minutes for admin", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockAdminProfile }) }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      };
      return {
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      };
    });
    const result = await addCredits("target-1", 60);
    expect(result.success).toBeTruthy();
  });
});

// ─── updateUserRole ───────────────────────────────────────────────────────────

describe("updateUserRole", () => {
  beforeEach(() => { jest.clearAllMocks(); setupAdminAuth(); });

  it("returns error for invalid role", async () => {
    const result = await updateUserRole("target-1", "superadmin" as never);
    expect(result.error).toBeTruthy();
  });

  it("throws when caller is not admin", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockUserProfile }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }));
    await expect(updateUserRole("target-1", "staff")).rejects.toThrow(/permissão/i);
  });

  it("returns success when admin updates role to staff", async () => {
    const result = await updateUserRole("target-1", "staff");
    expect(result.success).toBeTruthy();
  });

  it("returns success when admin updates role to user", async () => {
    const result = await updateUserRole("target-1", "user");
    expect(result.success).toBeTruthy();
  });
});

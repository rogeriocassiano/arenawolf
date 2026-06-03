/**
 * Testes unitários — actions/support.ts
 * Valida criação de tickets, envio de mensagens e encerramento.
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
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

import { sendSupportMessage, closeTicket } from "@/app/actions/support";

const makeFormData = (data: Record<string, string>): FormData => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  return fd;
};

// ─── sendSupportMessage ──────────────────────────────────────────────────────

describe("sendSupportMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const fd = makeFormData({ ticket_id: "t-1", body: "Minha mensagem aqui" });
    const result = await sendSupportMessage({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error for empty body", async () => {
    const fd = makeFormData({ ticket_id: "t-1", body: "" });
    const result = await sendSupportMessage({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/vazia/i);
  });

  it("returns error when ticket not found", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
    }));
    const fd = makeFormData({ ticket_id: "t-1", body: "Mensagem válida" });
    const result = await sendSupportMessage({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns error when ticket is closed", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { user_id: "user-1", status: "closed" } }) }) }),
    }));
    const fd = makeFormData({ ticket_id: "t-1", body: "Mensagem válida" });
    const result = await sendSupportMessage({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/encerrado/i);
  });

  it("returns error when user is not owner nor staff", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "support_tickets") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { user_id: "other-user", status: "open" } }) }) }),
        update: () => ({ eq: () => Promise.resolve({}) }),
      };
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "user" } }) }) }),
      };
      return { insert: jest.fn().mockResolvedValue({}) };
    });
    const fd = makeFormData({ ticket_id: "t-1", body: "Mensagem válida" });
    const result = await sendSupportMessage({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/acesso|negado/i);
  });

  it("returns success when owner sends message", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "support_tickets") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { user_id: "user-1", status: "open" } }) }) }),
        update: () => ({ eq: () => Promise.resolve({}) }),
      };
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "user" } }) }) }),
      };
      if (table === "support_messages") return { insert: jest.fn().mockResolvedValue({}) };
      return {};
    });
    const fd = makeFormData({ ticket_id: "t-1", body: "Mensagem do dono" });
    const result = await sendSupportMessage({ error: "", success: "" }, fd);
    expect(result.success).toBeTruthy();
  });

  it("returns success when staff sends message", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "support_tickets") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { user_id: "other-user", status: "open" } }) }) }),
        update: () => ({ eq: () => Promise.resolve({}) }),
      };
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
      };
      if (table === "support_messages") return { insert: jest.fn().mockResolvedValue({}) };
      return {};
    });
    const fd = makeFormData({ ticket_id: "t-1", body: "Resposta do staff" });
    const result = await sendSupportMessage({ error: "", success: "" }, fd);
    expect(result.success).toBeTruthy();
  });
});

// ─── closeTicket ─────────────────────────────────────────────────────────────

describe("closeTicket", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await closeTicket("t-1");
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error when ticket not found", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      update: () => ({ eq: () => Promise.resolve({}) }),
    }));
    const result = await closeTicket("t-1");
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns error when non-owner non-staff tries to close", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "support_tickets") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { user_id: "other-user" } }) }) }),
        update: () => ({ eq: () => Promise.resolve({}) }),
      };
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "user" } }) }) }),
      };
      return {};
    });
    const result = await closeTicket("t-1");
    expect(result.error).toMatch(/acesso|negado/i);
  });

  it("returns success when owner closes ticket", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "support_tickets") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { user_id: "user-1" } }) }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      };
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "user" } }) }) }),
      };
      return {};
    });
    const result = await closeTicket("t-1");
    expect(result.success).toBeTruthy();
  });

  it("returns success when admin closes ticket", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "support_tickets") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { user_id: "other" } }) }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      };
      if (table === "profiles") return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin" } }) }) }),
      };
      return {};
    });
    const result = await closeTicket("t-1");
    expect(result.success).toBeTruthy();
  });
});

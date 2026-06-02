/**
 * Testes unitários para as Server Actions de reservas.
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

import { createReservation, cancelReservation } from "@/app/actions/reservations";

const makeFormData = (data: Record<string, string>): FormData => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  return fd;
};

const validReservationData = {
  machine_id: "550e8400-e29b-41d4-a716-446655440000",
  start_at: new Date(Date.now() + 3600_000).toISOString(),
  duration_min: "60",
};

const mockMachine = { id: "550e8400-e29b-41d4-a716-446655440000", name: "Wolf 01", type: "pc", status: "free", price_per_hour: 10 };
const mockProfile = { credits_minutes: 120 };

describe("createReservation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-uuid" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const fd = makeFormData(validReservationData);
    const result = await createReservation({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error for invalid machine_id (not UUID)", async () => {
    const fd = makeFormData({ ...validReservationData, machine_id: "not-a-uuid" });
    const result = await createReservation({ error: "", success: "" }, fd);
    expect(result.error).toBeTruthy();
  });

  it("returns error for duration below 30min", async () => {
    const fd = makeFormData({ ...validReservationData, duration_min: "15" });
    const result = await createReservation({ error: "", success: "" }, fd);
    expect(result.error).toBeTruthy();
  });

  it("returns error for duration above 480min", async () => {
    const fd = makeFormData({ ...validReservationData, duration_min: "600" });
    const result = await createReservation({ error: "", success: "" }, fd);
    expect(result.error).toBeTruthy();
  });

  it("returns error when machine not found", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "machines") return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) };
      if (table === "profiles") return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockProfile }) }) }) };
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) };
    });
    const fd = makeFormData(validReservationData);
    const result = await createReservation({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/não encontrada/i);
  });

  it("returns error when machine is not free", async () => {
    const busyMachine = { ...mockMachine, status: "busy" };
    mockFrom.mockImplementation((table: string) => {
      if (table === "machines") return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: busyMachine }) }) }) };
      if (table === "profiles") return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockProfile }) }) }) };
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) };
    });
    const fd = makeFormData(validReservationData);
    const result = await createReservation({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/disponível/i);
  });

  it("returns error when credits insufficient", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "machines") return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockMachine }) }) }) };
      if (table === "profiles") return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { credits_minutes: 10 } }) }) }) };
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) };
    });
    const fd = makeFormData(validReservationData);
    const result = await createReservation({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/insuficientes/i);
  });
});

describe("cancelReservation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-uuid" } } });
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await cancelReservation("res-uuid");
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error when reservation not found", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) }),
    }));
    const result = await cancelReservation("res-uuid");
    expect(result.error).toMatch(/não encontrada/i);
  });

  it("returns error when trying to cancel active reservation", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { id: "res-uuid", status: "active", duration_min: 60, user_id: "user-uuid" } }) }) }) }),
    }));
    const result = await cancelReservation("res-uuid");
    expect(result.error).toMatch(/ativa/i);
  });
});

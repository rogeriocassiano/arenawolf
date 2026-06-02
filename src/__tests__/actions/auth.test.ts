/**
 * Testes unitários para as Server Actions de autenticação.
 * Supabase client é mockado para isolar a lógica de negócio.
 */

const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockResetPassword = jest.fn();
const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        signInWithPassword: mockSignIn,
        signUp: mockSignUp,
        resetPasswordForEmail: mockResetPassword,
        getUser: mockGetUser,
      },
      from: mockFrom,
    })
  ),
}));

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

import { login, register } from "@/app/actions/auth";

const makeFormData = (data: Record<string, string>): FormData => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  return fd;
};

describe("login action", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns error for invalid email", async () => {
    const fd = makeFormData({ email: "not-an-email", password: "123456" });
    const result = await login({ error: "", success: "" }, fd);
    expect(result.error).toBeTruthy();
  });

  it("returns error for short password", async () => {
    const fd = makeFormData({ email: "test@email.com", password: "abc" });
    const result = await login({ error: "", success: "" }, fd);
    expect(result.error).toBeTruthy();
  });

  it("returns error when Supabase returns invalid login", async () => {
    mockSignIn.mockResolvedValueOnce({ error: { message: "Invalid login credentials" } });
    const fd = makeFormData({ email: "test@email.com", password: "correctpassword" });
    const result = await login({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/incorretos/i);
  });

  it("redirects on success (throws NEXT_REDIRECT)", async () => {
    const { redirect } = require("next/navigation");
    redirect.mockImplementationOnce(() => { throw new Error("NEXT_REDIRECT"); });
    mockSignIn.mockResolvedValueOnce({ error: null });
    const fd = makeFormData({ email: "test@email.com", password: "validpassword" });
    await expect(login({ error: "", success: "" }, fd)).rejects.toThrow("NEXT_REDIRECT");
  });
});

describe("register action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({ upsert: jest.fn().mockResolvedValue({}) });
  });

  it("returns error for short nickname", async () => {
    const fd = makeFormData({ nickname: "ab", email: "test@email.com", password: "password123" });
    const result = await register({ error: "", success: "" }, fd);
    expect(result.error).toBeTruthy();
  });

  it("returns error for invalid nickname characters", async () => {
    const fd = makeFormData({ nickname: "nick name!", email: "test@email.com", password: "password123" });
    const result = await register({ error: "", success: "" }, fd);
    expect(result.error).toBeTruthy();
  });

  it("returns error for short password", async () => {
    const fd = makeFormData({ nickname: "wolfplayer", email: "test@email.com", password: "short" });
    const result = await register({ error: "", success: "" }, fd);
    expect(result.error).toBeTruthy();
  });

  it("returns error when email already registered", async () => {
    mockSignUp.mockResolvedValueOnce({ data: {}, error: { message: "User already registered" } });
    const fd = makeFormData({ nickname: "wolfplayer", email: "exists@email.com", password: "password123" });
    const result = await register({ error: "", success: "" }, fd);
    expect(result.error).toMatch(/já cadastrado/i);
  });

  it("returns success message on valid signup", async () => {
    mockSignUp.mockResolvedValueOnce({ data: { user: { id: "uuid-1" } }, error: null });
    const fd = makeFormData({ nickname: "wolfplayer", email: "new@email.com", password: "password123" });
    const result = await register({ error: "", success: "" }, fd);
    expect(result.success).toBeTruthy();
  });
});

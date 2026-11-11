import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SessionClient } from "@/app/(user)/session/SessionClient";

const mockRefresh = jest.fn();
const mockChannel = { on: jest.fn().mockReturnThis(), subscribe: jest.fn().mockReturnThis() };
const mockMachines = { select: jest.fn().mockReturnThis(), not: jest.fn().mockReturnThis(), order: jest.fn().mockResolvedValue({ data: [] }) };
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mockRefresh }) }));
jest.mock("@/lib/supabase/client", () => ({ createClient: () => ({ channel: () => mockChannel, removeChannel: jest.fn(), from: () => mockMachines }) }));

function openSession() {
  render(<SessionClient profile={{ id: "u-1", nickname: "Teste", credits_minutes: 240 }} machines={[]} activeSession={{
    id: "s-1", machine_id: "m-1", status: "active", started_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 3600000).toISOString(), machine: { id: "m-1", name: "Wolf 09" },
  }} />);
  fireEvent.click(screen.getByRole("button", { name: "Encerrar Sessão" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar Encerramento" }));
}

beforeEach(() => jest.clearAllMocks());

test("keeps the active session visible when the server rejects the end request", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Servidor não confirmou" }) });
  openSession();
  expect(await screen.findByRole("alert")).toHaveTextContent("Servidor não confirmou");
  expect(screen.getByRole("heading", { name: "Minha Sessão" })).toBeInTheDocument();
  expect(mockRefresh).not.toHaveBeenCalled();
});

test("clears the session and refreshes the real balance only after server confirmation", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
  openSession();
  await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  expect(screen.queryByRole("heading", { name: "Minha Sessão" })).not.toBeInTheDocument();
});

test("shows a retryable connection error without pretending the session ended", async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("offline"));
  openSession();
  expect(await screen.findByRole("alert")).toHaveTextContent("Verifique a conexão");
  expect(screen.getByRole("heading", { name: "Minha Sessão" })).toBeInTheDocument();
});

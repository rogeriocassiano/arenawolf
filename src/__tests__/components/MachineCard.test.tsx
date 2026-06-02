import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MachineCard } from "@/components/machines/MachineCard";
import { Machine } from "@/lib/types";

const mockPc: Machine = {
  id: "uuid-1",
  name: "Wolf 01",
  type: "pc",
  status: "free",
  price_per_hour: 10,
  created_at: new Date().toISOString(),
};

const mockPs5: Machine = {
  id: "uuid-2",
  name: "PS5 01",
  type: "ps5",
  status: "busy",
  price_per_hour: 10,
  created_at: new Date().toISOString(),
};

describe("MachineCard", () => {
  it("renders machine name", () => {
    render(<MachineCard machine={mockPc} />);
    expect(screen.getByText("Wolf 01")).toBeInTheDocument();
  });

  it("renders PC Gamer label for pc type", () => {
    render(<MachineCard machine={mockPc} />);
    expect(screen.getByText("PC Gamer")).toBeInTheDocument();
  });

  it("renders PlayStation 5 label for ps5 type", () => {
    render(<MachineCard machine={mockPs5} />);
    expect(screen.getByText("PlayStation 5")).toBeInTheDocument();
  });

  it("shows Reservar button when free and onReserve provided", () => {
    const onReserve = jest.fn();
    render(<MachineCard machine={mockPc} onReserve={onReserve} />);
    expect(screen.getByRole("button", { name: /reservar/i })).toBeInTheDocument();
  });

  it("calls onReserve when Reservar clicked", async () => {
    const user = userEvent.setup();
    const onReserve = jest.fn();
    render(<MachineCard machine={mockPc} onReserve={onReserve} />);
    await user.click(screen.getByRole("button", { name: /reservar/i }));
    expect(onReserve).toHaveBeenCalledWith(mockPc);
  });

  it("does not show Reservar button when busy", () => {
    render(<MachineCard machine={mockPs5} onReserve={jest.fn()} />);
    expect(screen.queryByRole("button", { name: /reservar/i })).not.toBeInTheDocument();
  });

  it("shows status badge", () => {
    render(<MachineCard machine={mockPc} />);
    expect(screen.getByText("Livre")).toBeInTheDocument();
  });

  it("hides price in compact mode", () => {
    render(<MachineCard machine={mockPc} compact />);
    expect(screen.queryByText(/Valor\/hora/i)).not.toBeInTheDocument();
  });
});

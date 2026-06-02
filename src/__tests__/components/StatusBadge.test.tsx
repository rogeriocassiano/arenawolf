import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/machines/StatusBadge";

describe("StatusBadge", () => {
  it("renders 'Livre' for free status", () => {
    render(<StatusBadge status="free" />);
    expect(screen.getByText("Livre")).toBeInTheDocument();
  });

  it("renders 'Ocupado' for busy status", () => {
    render(<StatusBadge status="busy" />);
    expect(screen.getByText("Ocupado")).toBeInTheDocument();
  });

  it("renders 'Reservado' for reserved status", () => {
    render(<StatusBadge status="reserved" />);
    expect(screen.getByText("Reservado")).toBeInTheDocument();
  });

  it("renders 'Manutenção' for maintenance status", () => {
    render(<StatusBadge status="maintenance" />);
    expect(screen.getByText("Manutenção")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<StatusBadge status="free" className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

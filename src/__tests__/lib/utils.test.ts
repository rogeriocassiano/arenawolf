import {
  cn,
  formatCurrency,
  formatMinutes,
  formatDate,
  formatDateTime,
  formatTime,
} from "@/lib/utils";

describe("cn()", () => {
  it("merges class names correctly", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skip", "add")).toBe("base add");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("formatCurrency()", () => {
  it("formats 1000 cents as R$ 10,00", () => {
    expect(formatCurrency(1000)).toMatch(/10,00/);
  });

  it("formats 0 as R$ 0,00", () => {
    expect(formatCurrency(0)).toMatch(/0,00/);
  });

  it("formats 7000 cents as R$ 70,00", () => {
    expect(formatCurrency(7000)).toMatch(/70,00/);
  });
});

describe("formatMinutes()", () => {
  it("formats 30 as '30min'", () => {
    expect(formatMinutes(30)).toBe("30min");
  });

  it("formats 60 as '1h'", () => {
    expect(formatMinutes(60)).toBe("1h");
  });

  it("formats 90 as '1h 30min'", () => {
    expect(formatMinutes(90)).toBe("1h 30min");
  });

  it("formats 120 as '2h'", () => {
    expect(formatMinutes(120)).toBe("2h");
  });

  it("formats 480 as '8h'", () => {
    expect(formatMinutes(480)).toBe("8h");
  });

  it("formats 0 as '0min'", () => {
    expect(formatMinutes(0)).toBe("0min");
  });
});

describe("formatDate()", () => {
  it("formats ISO date string to pt-BR", () => {
    const result = formatDate("2025-06-15T00:00:00Z");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("accepts Date object", () => {
    const result = formatDate(new Date("2025-01-01"));
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe("formatDateTime()", () => {
  it("includes time in output", () => {
    const result = formatDateTime("2025-06-15T14:30:00Z");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe("formatTime()", () => {
  it("returns only time in HH:MM", () => {
    const result = formatTime("2025-06-15T10:30:00Z");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

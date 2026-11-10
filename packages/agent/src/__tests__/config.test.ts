import { getConfig, setConfig } from "../config";

describe("site migration", () => {
  it("uses the new production site by default", () => {
    expect(getConfig().apiBaseUrl).toBe("https://arena-wolftech-app.netlify.app");
  });

  it.each(["https://arenawolftech.netlify.app", "https://arenawolf.netlify.app"])("migrates %s without changing machine credentials", apiBaseUrl => {
    setConfig({ apiBaseUrl, machineId: "wolf-09", agentKey: "test-key" });
    expect(getConfig()).toMatchObject({ apiBaseUrl: "https://arena-wolftech-app.netlify.app", machineId: "wolf-09", agentKey: "test-key" });
  });

  it("preserves explicitly configured custom sites", () => {
    setConfig({ apiBaseUrl: "http://localhost:3000" });
    expect(getConfig().apiBaseUrl).toBe("http://localhost:3000");
  });
});

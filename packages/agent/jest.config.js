module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    electron: "<rootDir>/src/__mocks__/electron.ts",
    "electron-store": "<rootDir>/src/__mocks__/electron-store.ts",
  },
};

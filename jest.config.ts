import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "@swc/jest",
  },
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  resetMocks: true,
  testMatch: ["<rootDir>/src/**/*.test.ts"],
};

export default config;

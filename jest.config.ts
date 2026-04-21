import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Match your path alias
  },
  setupFiles: ["<rootDir>/src/__test__/setup.ts"],
};

export default config;

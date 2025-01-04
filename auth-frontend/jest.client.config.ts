import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

export default createJestConfig({
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/app/(.*)$": "<rootDir>/app/$1", // Maps "@/app/" to the actual path
    "^@/components/(.*)$": "<rootDir>/components/$1", // Maps "@/components/" to the actual path
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/__tests__/utils/",
  ],
  testMatch: [
    "**/__tests__/client/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).client.+(ts|tsx|js)",
  ],
  coverageDirectory: "coverage/client",
});

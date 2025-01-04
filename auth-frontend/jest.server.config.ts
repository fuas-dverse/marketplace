import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

export default createJestConfig({
  testEnvironment: "node",
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
    "**/__tests__/server/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).server.+(ts|tsx|js)",
  ],
  coverageDirectory: "coverage/server",
});

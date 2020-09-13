module.exports = {
  verbose: false,
  testEnvironment: "node",
  preset: "ts-jest",
  testMatch: [
    "<rootDir>/**/__tests__/**/*test.@(js|ts)?(x)"
  ],
  rootDir: "./",
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.cjs.json"
    },
  },
  collectCoverage: false,
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: ["<rootDir>/src/**/*.ts", "!<rootDir>/src/**/*.d.ts"],
};

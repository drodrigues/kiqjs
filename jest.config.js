/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/examples'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@kiqjs/core(.*)$': '<rootDir>/packages/core/src$1',
    '^@kiqjs/http(.*)$': '<rootDir>/packages/http/src$1',
    '^@kiqjs/repository(.*)$': '<rootDir>/packages/repository/src$1',
  },
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json', // aponta explicitamente
        diagnostics: true,
      },
    ],
  },
};

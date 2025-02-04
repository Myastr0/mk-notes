import { type JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: '<rootDir>',
});
const config: JestConfigWithTsJest = {
  collectCoverage: true,
  collectCoverageFrom: ['api/**/*.(ts|js)', '!**/__tests__/*'],
  coverageReporters: ['lcov'],
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./__tests__/_setup.ts'],
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '_[a-zA-Z0-9]+.(js|ts)$',
    '__fixtures__',
    '__fakes__',
    'dist',
  ],
  testRegex: '\\.test\\.ts$',
  workerIdleMemoryLimit: '1000MB',
};

if (moduleNameMapper !== undefined) {
  config.moduleNameMapper = moduleNameMapper;
}

// eslint-disable-next-line import/no-default-export
export default config;

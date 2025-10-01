import pluginJest from 'eslint-plugin-jest';
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  [
    // 1) Ignore patterns: same as "ignorePatterns" in old config
    {
      ignores: [
        'node_modules/',
        'dist/',
        'coverage/',
        'docs/',
        'jest.config.js',
        '__generated__/',
        '__tests__/_setup.ts',
        'jest.config.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        'eslint.config.mjs',
      ],
    },
    // 2) Main config for JS/TS files
    {
      files: ['**/*.{js,ts,jsx,tsx}'],
      ignores: ['**/*.spec.ts', '**/*.test.ts'],
      // Bring in ESLint's recommended config, plus custom parser settings

      // Register plugins so we can use their rules
      plugins: {
        'simple-import-sort': simpleImportSortPlugin,
        import: importPlugin,
      },

      // Combine recommended rules from ESLint, TypeScript, and Prettier
      rules: {
        // Then override with your custom rules
        'prettier/prettier': 'error',
        '@typescript-eslint/no-var-requires': 'off',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'no-case-declarations': 'off',
        'no-console': 'error',

        'prefer-destructuring': [
          'error',
          { array: true, object: true },
          { enforceForRenamedProperties: false },
        ],

        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/promise-function-async': 'error',
        'import/no-default-export': 'error',
      },
    },
    // 3) Overrides for generated code
    {
      files: ['src/shared/__generated__/**/*'],
      rules: {
        '@typescript-eslint/no-restricted-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    // 4) Override that excludes ./src/**/* and disables certain TS rules
    {
      files: ['**/*'], // applies to all
      ignores: ['src/**/*'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/promise-function-async': 'off',
      },
    },
    // 5) Override for scripts/ folder that allows console
    {
      files: ['scripts/**/*'],
      rules: {
        'no-console': 'off',
      },
    },
    // 6) Override for test files
    {
      // update this to match your test files
      files: ['**/*.spec.ts', '**/*.test.ts', '**/**.test.ts'],
      plugins: { jest: pluginJest },
      languageOptions: {
        globals: pluginJest.environments.globals.globals,
      },
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
      },
    },
    // 7) Disable rules for test files
    {
      files: ['**/*.spec.ts', '**/*.test.ts', '**/**.test.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
      },
    },
  ]
);

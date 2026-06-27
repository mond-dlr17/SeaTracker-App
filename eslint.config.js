// Flat ESLint config (ESLint 9). Built on Expo's shared config.
// `eslint-config-prettier` is last so Prettier owns all formatting.
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    rules: {
      // Makes the existing `eslint-disable-next-line no-console` directives
      // meaningful: console is discouraged, intentional warns opt out explicitly.
      'no-console': 'warn',

      // React Compiler rules are new in Expo SDK 55. The existing codebase
      // predates them, so adopt incrementally as warnings (a burn-down backlog)
      // rather than blocking CI on pre-existing patterns. Promote to "error"
      // once outstanding violations are cleared.
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
  {
    ignores: [
      'dist/*',
      'ios/*',
      'android/*',
      '.expo/*',
      'node_modules/*',
      'assets/*',
      'ReactotronConfig.ts',
    ],
  },
];

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

      // React Compiler correctness rules (new in Expo SDK 55). Existing
      // violations have been cleared, so these are enforced as errors.
      'react-hooks/immutability': 'error',
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/purity': 'error',
      'react/no-unescaped-entities': 'error',
    },
  },
  {
    ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*', 'node_modules/*', 'assets/*', 'ReactotronConfig.ts'],
  },
];

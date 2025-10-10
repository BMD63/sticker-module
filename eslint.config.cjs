const vue = require('eslint-plugin-vue')
const vueParser = require('vue-eslint-parser')
const ts = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const prettier = require('eslint-config-prettier')

const vueFlatPreset = vue.configs['flat/recommended'] ?? []

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      '.nitro/**',
      '.output/**',
      'dist/**',
      'coverage/**',
      '.vite/**',
      '.cache/**',
      '*.log',
      '.DS_Store',
      '.env*',
    ],
  },

  ...([]).concat(vueFlatPreset),

  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue,
      '@typescript-eslint': ts,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  {
    files: ['tests/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
]

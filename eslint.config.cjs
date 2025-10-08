const vue = require('eslint-plugin-vue')
const vueParser = require('vue-eslint-parser')
const ts = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')


const vueFlatPreset = vue.configs['flat/recommended'] ?? []

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '.nuxt/**',
      '.nitro/**',
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
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'warn',
    },
  },
]

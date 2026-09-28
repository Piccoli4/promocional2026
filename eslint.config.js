import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Cada contexto exporta su Provider junto con su hook de acceso.
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true, allowExportNames: ['useAuth', 'useTheme', 'usePWAInstall'] },
      ],
    },
  },
  {
    // Función de Netlify y scripts de mantenimiento: corren en Node.
    files: ['netlify/**/*.js', 'scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Service worker de FCM: `firebase` lo cargan los importScripts.
    files: ['public/firebase-messaging-sw.js'],
    languageOptions: { globals: { ...globals.serviceworker, firebase: 'readonly' } },
  },
])

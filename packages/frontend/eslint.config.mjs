import js from '@eslint/js';
import globals from 'globals';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import pluginPromise from "eslint-plugin-promise";
import reactPlugin from "eslint-plugin-react";
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: ['dist', 'vite.config.ts'],

  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  reactHooksPlugin.configs.flat.recommended,
  reactPlugin.configs.flat.recommended,
  pluginPromise.configs['flat/recommended'],
  {
    files: ['*.config.{ts,mjs,js}', 'vite.config.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
  // React Settings für alle Dateien
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  {
    plugins: {
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],  // Array statt einzelner Datei!
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",

      // React-Regeln für moderne JSX-Transform (React 17+)
      "react/react-in-jsx-scope": "off",  // React-Import nicht mehr nötig
      "react/prop-types": "off",           // TypeScript übernimmt die Typprüfung

      // Import-Plugin Regeln
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-unresolved": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: true,
      },
    },
  }
]
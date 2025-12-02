import pluginJs from "@eslint/js";
import pluginJsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  tseslint.configs.recommended,
  { 
    languageOptions: { 
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { 
      js: pluginJs,
      jsdoc: pluginJsdoc
    },
    extends: ["js/recommended"], 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    ignores: ["eslint.config.js", "dist", "build", "node_modules"],
    rules: {
      /* --- Style --- */
      "no-var": "error",
      "no-unused-vars": "warn",
      "prefer-const": "warn",
      "eqeqeq": ["error", "always"], // use ===
      "quotes": ["warn", "single", { avoidEscape: true }],
      "semi": ["error", "always"],
      "camelcase": ['error', {
        allow: ['^UNSAFE_'],
        properties: 'never',
        ignoreGlobals: true
      }],
      
      /* --- TS specifics --- */
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      /* --- JS Doc --- */      
      'jsdoc/require-jsdoc': ['off'],
      'jsdoc/check-tag-names': ['error'],
      'jsdoc/require-description': ['error'],
      'jsdoc/require-description-complete-sentence': ['error'],
      'jsdoc/require-param': ['error'],
      'jsdoc/require-param-description': ['error'],
      'jsdoc/require-param-name': ['error'],
      'jsdoc/require-param-type': ['error'],
      'jsdoc/require-returns': ['error', { forceReturnsWithAsync: true }],
      'jsdoc/require-returns-check': ['error'],
      'jsdoc/require-returns-description': ['error'],
      'jsdoc/require-returns-type': ['error'],
      'jsdoc/require-throws': ['error'],
    }
  },
]);
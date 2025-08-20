import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import astro from "eslint-plugin-astro";

// parsers
const astroParser = astro.parser;

export default defineConfig([
  // Global configuration
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // Base configs
  js.configs.recommended,
  // astro setup
  astro.configs.recommended,
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        extraFileExtensions: [".astro"],
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    rules: {
      "no-undef": "off", // Disable "not defined" errors for specific Astro types that are globally available (ImageMetadata)
    },
  },
  // Ignore patterns
  {
    ignores: ["dist/**", ".github/"],
  },
]);

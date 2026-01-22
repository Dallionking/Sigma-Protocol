import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["tools/**/*.js", "src/**/*.js", "cli/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_", 
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
      "no-console": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "boilerplates/**",
      "Magic UI/**",
      "dist/**",
      "build/**",
    ],
  },
];


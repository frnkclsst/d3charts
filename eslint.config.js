import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      // ── Naming conventions ─────────────────────────────────────────────────
      // class-name: true          → classes must be PascalCase
      // interface-name: true      → interfaces must be prefixed with "I"
      // variable-name: [allow-leading-underscore, allow-pascal-case]
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "class",         format: ["PascalCase"] },
        { selector: "interface",     format: ["PascalCase"], prefix: ["I"] },
        { selector: "typeAlias",     format: ["PascalCase"] },
        { selector: "typeParameter", format: ["PascalCase"] },
        { selector: "variable",      format: ["camelCase", "PascalCase", "UPPER_CASE"], leadingUnderscore: "allow" },
        { selector: "parameter",     format: ["camelCase"], leadingUnderscore: "allow" },
        { selector: "classProperty", format: ["camelCase"], leadingUnderscore: "allow" },
        { selector: "classMethod",   format: ["camelCase"], leadingUnderscore: "allow" },
      ],

      // ── Member ordering ────────────────────────────────────────────────────
      // member-ordering: [public-before-private, static-before-instance, variables-before-functions]
      "@typescript-eslint/member-ordering": ["error", {
        default: [
          "public-static-field",
          "protected-static-field",
          "private-static-field",
          "public-instance-field",
          "protected-instance-field",
          "private-instance-field",
          "constructor",
          "public-static-method",
          "protected-static-method",
          "private-static-method",
          "public-instance-method",
          "protected-instance-method",
          "private-instance-method",
        ],
      }],

      // ── Type annotations ───────────────────────────────────────────────────
      // member-access: true   → explicit public/private/protected on class members
      "@typescript-eslint/explicit-member-accessibility": "error",
      // typedef: property-declaration and member-variable-declaration only
      // (parameter: true removed — TypeScript infers callback param types well)
      "@typescript-eslint/typedef": ["error", {
        propertyDeclaration:        true,
        memberVariableDeclaration:  true,
      }],
      // (explicit-function-return-type covers function return types)
      "@typescript-eslint/explicit-function-return-type": "error",

      // ── no-any ─────────────────────────────────────────────────────────────
      // no-any: false → warn only (do not error)
      "@typescript-eslint/no-explicit-any": "warn",

      // ── Unnecessary type assertions ────────────────────────────────────────
      "@typescript-eslint/no-unnecessary-type-assertion": "error",

      // ── Prefer readonly ────────────────────────────────────────────────────
      "@typescript-eslint/prefer-readonly": "error",

      // ── Consistent type imports ────────────────────────────────────────────
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

      // ── No inferrable types ────────────────────────────────────────────────
      // ignoreProperties: true — class fields need explicit types for typedef rule
      "@typescript-eslint/no-inferrable-types": ["error", { ignoreProperties: true }],

      // ── Strict equality ────────────────────────────────────────────────────
      "eqeqeq": ["error", "always"],

      // ── Unused variables ───────────────────────────────────────────────────
      // no-unused-variable: true
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],

      // ── Quotes ─────────────────────────────────────────────────────────────
      // quotemark: [true, "double", "avoid-escape"]
      "quotes": ["error", "double", { avoidEscape: true }],

      // ── Semicolons ─────────────────────────────────────────────────────────
      // semicolon: true
      "semi": ["error", "always"],

      // ── Trailing commas ────────────────────────────────────────────────────
      // trailing-comma: [true, { multiline: "never", singleline: "never" }]
      "comma-dangle": ["error", "never"],

      // ── Dot notation ───────────────────────────────────────────────────────
      // no-string-literal: true → prefer obj.prop over obj["prop"]
      "dot-notation": "error",

      // ── Variable shadowing ─────────────────────────────────────────────────
      // no-shadowed-variable: true
      "no-shadow": "error",

      // ── Use before define ──────────────────────────────────────────────────
      // no-use-before-declare: true
      "no-use-before-define": ["error", { functions: false, classes: true }],

      // ── Base ESLint rules ──────────────────────────────────────────────────
      // curly: true
      "curly": "error",
      // forin: true → require hasOwnProperty check in for-in loops
      "guard-for-in": "error",
      // max-line-length: [true, 180]
      "max-len": ["error", { code: 180, ignoreComments: true, ignoreUrls: true }],
      // no-arg: true → disallow arguments.callee
      "no-caller": "error",
      // no-bitwise: true
      "no-bitwise": "error",
      // no-consecutive-blank-lines: true
      "no-multiple-empty-lines": ["error", { max: 1 }],
      // no-console: [true, "debug", "info", "time", "timeEnd", "trace"]
      "no-console": ["error", { allow: ["warn", "error", "log"] }],
      // no-construct: true → disallow new String(), new Number(), new Boolean()
      "no-new-wrappers": "error",
      // no-eval: true
      "no-eval": "error",
      // no-trailing-whitespace: true
      "no-trailing-spaces": "error",
      // no-unused-expression: true
      "no-unused-expressions": "error",
      // radix: true → require radix argument in parseInt()
      "radix": "error",
      // comment-format: [true] → require space after // in line comments
      "spaced-comment": ["error", "always"],
    },
  },
];

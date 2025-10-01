import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // 预防未使用变量错误
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "after-used",
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrors": "none" // 允许空catch块
        }
      ],

      // 预防React未转义引号错误
      "react/no-unescaped-entities": "error",

      // 其他常见问题预防
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",

      // TypeScript相关
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "warn",

      // React相关
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-key": "error"
    }
  }
];

export default eslintConfig;

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });
const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: ["next-env.d.ts", ".next/**", "out/**", "dist/**", "build/**", "coverage/**", "consolidation/**", "j20-p42/**", "raccordement-assistance/**", "raccordement-assistance-FINAL/**", "OMEGA-CONTENU-COMPLET/**", "public/espace-client/**"] },
  { rules: { "no-restricted-imports": ["error", { paths: [{ name: "@prisma/client", importNames: ["PrismaClient"], message: "Importez l'instance partagee depuis '@/lib/prisma'." }] }] } },
  { files: ["src/lib/prisma.ts"], rules: { "no-restricted-imports": "off" } },
];
export default config;

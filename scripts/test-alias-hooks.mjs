// Module resolution hooks for scripts/test-alias.mjs. Only `.ts` targets: Node strips types but
// cannot run JSX, so tests stay on data and logic modules.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = new URL("../src/", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  let base;
  if (specifier.startsWith("@/")) {
    base = new URL(specifier.slice(2), SRC);
  } else if (
    /^\.\.?\//.test(specifier) &&
    context.parentURL?.endsWith(".ts") &&
    !/\.[a-z]+$/i.test(specifier)
  ) {
    base = new URL(specifier, context.parentURL);
  }
  if (base) {
    for (const suffix of [".ts", "/index.ts"]) {
      const url = new URL(base.href + suffix);
      if (existsSync(fileURLToPath(url))) return nextResolve(url.href, context);
    }
  }
  return nextResolve(specifier, context);
}

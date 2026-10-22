// Lets `node --test` load app modules the way the bundler does: the `@/` alias and
// extensionless relative imports between `.ts` files. Loaded with `node --import`.
import { register } from "node:module";

register("./test-alias-hooks.mjs", import.meta.url);

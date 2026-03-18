import { defineConfig } from "tsup";

export default defineConfig({
  entry: { d3charts: "src/index.ts" },
  format: ["esm", "cjs", "iife"],
  globalName: "D3Charts",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["d3"],
  esbuildOptions(options) {
    options.footer = {
      js: "// @frnkclsst/d3charts - built with tsup",
    };
  },
});

import { defineConfig, Plugin } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";

const copyCssPlugin = (): Plugin => {
  const src = resolve(__dirname, "src/css/d3charts.css");
  const dest = resolve(__dirname, "dist/css/d3charts.css");
  const copy = () => {
    mkdirSync(resolve(__dirname, "dist/css"), { recursive: true });
    copyFileSync(src, dest);
  };
  return {
    name: "copy-css",
    buildStart: copy,
    handleHotUpdate({ file }) {
      if (file === src) copy();
    },
  };
};

export default defineConfig({
  resolve: {
    alias: {
      "@frnkclsst/d3charts": resolve(__dirname, "src/index.ts"),
    },
  },
  plugins: [copyCssPlugin()],
  server: {
    port: 9005,
    open: "/examples/gallery.html",
  },
});

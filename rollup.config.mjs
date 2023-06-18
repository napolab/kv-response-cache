import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { externals } from "rollup-plugin-node-externals";
import tsConfigPaths from "rollup-plugin-tsconfig-paths";

const out = "dist";

export const config = defineConfig({
  input: ["src/index.ts"],
  output: [
    {
      format: "esm",
      entryFileNames: "[name].mjs",
      dir: out,
      sourcemap: true,
    },
    {
      format: "cjs",
      entryFileNames: "[name].js",
      dir: out,
      sourcemap: true,
    },
  ],
  plugins: [externals(), tsConfigPaths(), esbuild()],
});

export const typeConfig = defineConfig({
  ...config,
  output: {
    dir: out,
  },
  plugins: [...config.plugins, dts({ tsconfig: "./tsconfig.json" })],
});

export default [config, typeConfig];

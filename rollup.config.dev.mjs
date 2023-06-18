import run from "@rollup/plugin-run";
import deepmerge from "deepmerge";
import { defineConfig } from "rollup";

import { config as baseConfig } from "./rollup.config.mjs";

export const config = defineConfig(
  deepmerge(
    baseConfig,
    {
      output: [
        {
          format: "esm",
          dir: "dist",
          sourcemap: "inline",
        },
      ],
      plugins: [run()],
    },
    {
      customMerge: (key) => {
        if (key === "output") return (left, right) => right;

        return deepmerge;
      },
    }
  )
);

export default [config];

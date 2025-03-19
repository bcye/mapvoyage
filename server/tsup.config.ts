import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs"],
  target: "node16",
  minify: true,
  bundle: true,
  external: [],
  noExternal: [/.*/],
  plugins: [],
});

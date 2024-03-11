import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import tsConfigPaths from "vite-tsconfig-paths";
import { EsLinter, linterPlugin, TypeScriptLinter } from "vite-plugin-linter";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import * as packageJson from "./package.json";

export default defineConfig((configEnv) => ({
  plugins: [
    react(),
    tsConfigPaths(),
    linterPlugin({
      include: ["./src/**/*.{ts,tsx}"],
      linters: [
        new EsLinter({ configEnv, serveOptions: { clearCacheOnStart: true } }),
        new TypeScriptLinter(),
      ],
    }),
    dts({
      include: ["src/"],
      exclude: ["src/components/**/stories/"],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "reactjs-datetime-range-picker",
      // formats: ['es', 'umd', 'cjs'],
      // fileName: (format) => `reactjs-datetime-range-picker.${format}.js`,
      fileName: "index",
    },
    outDir: "dist",
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
      input: "./dist/index.d.ts",
      output: {
        file: "dist/index.d.ts",
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer()],
    },
  },
}));

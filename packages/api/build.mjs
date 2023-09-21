import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: ".build/main.mjs",
  format: "esm",
  target: "esnext",
  platform: "node",
  // Questo serve per mantenerci compatibili con commonJS, purtroppo
  banner: {
    js: `
        import path from 'path';
        import { fileURLToPath } from 'url';
        import { createRequire as topLevelCreateRequire } from 'module';
        const require = topLevelCreateRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        `,
  },
});

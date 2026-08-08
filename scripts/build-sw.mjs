// Postbuild step: bundles src/sw.ts with esbuild (classic-worker IIFE, no
// ESM import/export survives) and runs workbox-build's injectManifest on the
// result to inject the real precache manifest, writing dist/sw.js.
//
// Replaces the vite-plugin-pwa `injectManifest` strategy, which the plugin no
// longer performs correctly under Astro 7's shared multi-environment Vite
// builder (see CLAUDE.md PWA notes).
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { injectManifest } from 'workbox-build';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(rootDir, 'dist');
const swSrc = join(rootDir, 'src', 'sw.ts');
const swDest = join(distDir, 'sw.js');

const tempDir = await mkdtemp(join(tmpdir(), 'meal-guru-sw-'));
const bundledSw = join(tempDir, 'sw.bundled.js');

try {
  await esbuild.build({
    entryPoints: [swSrc],
    outfile: bundledSw,
    bundle: true,
    format: 'iife',
    target: 'es2020',
    minify: true,
  });

  const { count, size, warnings } = await injectManifest({
    swSrc: bundledSw,
    swDest,
    globDirectory: distDir,
    globIgnores: ['sw.js', 'registerSW.js', 'manifest.webmanifest'],
  });

  for (const warning of warnings) {
    console.warn(warning);
  }

  console.log(`Injected ${count} precache entries (${size} bytes) into dist/sw.js`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

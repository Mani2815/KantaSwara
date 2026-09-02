#!/usr/bin/env node
// =============================================================================
// Copy ONNX Runtime WASM files to public/wasm/
// =============================================================================
// Turbopack (Next.js 16 default) does not support copy-webpack-plugin.
// This script copies the WASM binaries that onnxruntime-web needs at runtime
// into public/wasm/ so they're served as static assets.
//
// Run automatically via the "prebuild" npm script.
// =============================================================================

import { cpSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const ortDistDir = join(projectRoot, 'node_modules', 'onnxruntime-web', 'dist');
const targetDir = join(projectRoot, 'public', 'wasm');

if (!existsSync(ortDistDir)) {
  console.warn('⚠️  onnxruntime-web/dist not found — skipping WASM copy');
  process.exit(0);
}

// Ensure target directory exists
mkdirSync(targetDir, { recursive: true });

// Copy .wasm and .mjs files (the ONNX Runtime needs both at runtime)
const files = readdirSync(ortDistDir).filter(
  (f) => f.endsWith('.wasm') || f.endsWith('.mjs')
);

let copied = 0;
for (const file of files) {
  const src = join(ortDistDir, file);
  const dest = join(targetDir, file);
  cpSync(src, dest);
  copied++;
}

console.log(`✅ Copied ${copied} ONNX Runtime files to public/wasm/`);

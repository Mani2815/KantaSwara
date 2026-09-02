import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // onnxruntime-web is browser-only — exclude from server bundling
  serverExternalPackages: ['onnxruntime-web'],

  // Next.js 16 uses Turbopack by default.
  // onnxruntime-web/wasm has "node": null in its exports map, which blocks
  // Turbopack's SSR resolution. Alias it directly to the CJS dist file,
  // bypassing the exports map entirely.
  // WASM binaries are served from public/wasm/ via the prebuild script.
  turbopack: {
    resolveAlias: {
      'onnxruntime-web/wasm': './node_modules/onnxruntime-web/dist/ort.wasm.min.js',
    },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

export default nextConfig;

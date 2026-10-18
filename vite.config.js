import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5191,
    host: "127.0.0.1",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 800, // three.js alone is ~600 kB before gzip
  },
  test: {
    environment: "node",
  },
});

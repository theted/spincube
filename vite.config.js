import { defineConfig } from "vite";
import { resolve } from "path";

// Define environment variables for build
const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  define: {
    // Replace DEBUG constant with false in production builds
    "process.env.DEBUG": isProd ? false : true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: "terser", // Use terser for better minification
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        // Generate a single JS file
        manualChunks: () => "index", // Force all code into a single chunk
        entryFileNames: "assets/[name].js", // Remove hash for cleaner filenames
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"], // Optional setup file for tests
  },
});

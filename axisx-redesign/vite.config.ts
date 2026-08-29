import { defineConfig } from "vite";

export default defineConfig({
  base: "/ai/data/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
  },
  preview: {
    host: "0.0.0.0",
  },
});

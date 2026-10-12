import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import versionPlugin from "./vite-plugin-version.js";

export default defineConfig({
  plugins: [react(), versionPlugin()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8004", changeOrigin: true },
    },
  },
});

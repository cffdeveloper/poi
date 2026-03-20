import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["intelgoldmine.onrender.com", ".onrender.com"],
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "::",
    port: 10000,
    allowedHosts: ["intelgoldmine.onrender.com", ".onrender.com"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

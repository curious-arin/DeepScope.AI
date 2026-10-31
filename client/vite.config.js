import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Forward /api calls to the FastAPI backend
  server: { proxy: { "/api": "http://127.0.0.1:8000" } },
});

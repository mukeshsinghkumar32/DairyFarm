import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/v1": {
        target: "https://dairyfarm-backend-7ie0.onrender.com/",
        changeOrigin: true,
      },
      // Laravel storage (keep for compatibility)
      "/storage": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      // Node.js uploads
      "/uploads": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});

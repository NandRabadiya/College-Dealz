import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { API_BASE_URL } from './src/pages/Api/api.js'

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    proxy: {
      "/api": {
        target: API_BASE_URL, // ⬅️ Replace this with your EC2 IP or domain
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})

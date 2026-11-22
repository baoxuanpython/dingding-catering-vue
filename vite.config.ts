import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    // 固定端口：后端 WebSocket 的 Origin 白名单按 5173 配置，
    // 端口漂移会导致握手被 403 拒绝，表现为「连不上且没有任何提示」
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/admin"),
      },
    },
  },
});

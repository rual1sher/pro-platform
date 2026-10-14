import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Only /api is proxied: the client always calls the backend through
      // env.config.ts's baseUrl ("/api"). Proxying bare "/tasks" or
      // "/organizations" here would collide with the client-side routes of
      // the same name and hijack a page reload with raw API JSON.
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});

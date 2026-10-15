import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tanstackStart(), nitro({ preset: "render_com" }), viteReact(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  server: { host: "0.0.0.0", port: 3000 },
  preview: { host: "0.0.0.0", port: 4173 },
});

// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
    plugins: [react()],
    publicDir: "public", // manifest 등 복사
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, "index.html"), // ★ 루트 index.html
                background: resolve(__dirname, "src/background/background.js"),
                content: resolve(__dirname, "src/content/content.js"),
            },
            output: {
                entryFileNames: (chunk) => {
                    if (chunk.name === "background") return "background.js";
                    if (chunk.name === "content") return "content.js";
                    return "assets/[name]-[hash].js";
                },
                assetFileNames: (asset) => {
                    if (/\.(png|ico|svg)$/.test(asset.name || ""))
                        return "[name][extname]";
                    return "assets/[name]-[hash][extname]";
                },
            },
        },
    },
});

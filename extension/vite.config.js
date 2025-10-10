import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
    plugins: [react()],
    publicDir: "public", // manifest, index.html, 아이콘 등 복사
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, "public/index.html"), // 팝업 엔트리
                background: resolve(__dirname, "src/background/background.js"),
                content: resolve(__dirname, "src/content/content.js"),
            },
            output: {
                // manifest에서 지정한 파일명과 일치시키기 위해 background/content는 고정
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === "background") return "background.js";
                    if (chunkInfo.name === "content") return "content.js";
                    // popup 등 나머지 엔트리는 자산 폴더로
                    return "assets/[name]-[hash].js";
                },
                assetFileNames: (assetInfo) => {
                    if (/\.(png|ico|svg)$/.test(assetInfo.name || "")) {
                        return "[name][extname]";
                    }
                    return "assets/[name]-[hash][extname]";
                },
            },
        },
    },
});

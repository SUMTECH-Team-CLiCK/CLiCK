import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                background: resolve(__dirname, "src/background/background.js"),
                content: resolve(__dirname, "src/content/content.jsx"), // 진입점을 content.jsx로 지정
            },
            output: {
                entryFileNames: (chunk) => `${chunk.name}.js`, // 결과물 파일명을 background.js, content.js로 고정
            },
        },
    },
});

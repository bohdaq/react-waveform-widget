import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-waveform-widget": fileURLToPath(
        new URL("../dist/index.js", import.meta.url)
      ),
    },
  },
});

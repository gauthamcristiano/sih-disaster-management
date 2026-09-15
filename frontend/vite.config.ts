import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/sih-disaster-management/",
  plugins: [react()],

  server: {
    port: 5173,
    host: "localhost",
  },
});

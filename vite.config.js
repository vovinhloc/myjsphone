import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: "gcall.com.vn",
      https: {
        key: "/etc/letsencrypt/live/gcall.com.vn/privkey.pem",
        cert: "/etc/letsencrypt/live/gcall.com.vn/fullchain.pem",
      },
    },
    define: {
      'process.env': env,
    },
    build: {
      sourcemap: true,
      ignoreSourceMapWarning: true,
    },
    // optimizeDeps: {
    //   include: ['@reduxjs/toolkit'],
    // },
  };
});

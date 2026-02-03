import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

import { miaodaDevPlugin } from "miaoda-sc-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr({
      svgrOptions: {
        icon: true, exportType: 'named', namedExport: 'ReactComponent', }, }), miaodaDevPlugin() as any],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/dashscope-api': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dashscope-api/, ''),
        headers: {
          'Origin': 'https://dashscope.aliyuncs.com',
          'Referer': 'https://dashscope.aliyuncs.com',
        }
      }
    }
  }
});

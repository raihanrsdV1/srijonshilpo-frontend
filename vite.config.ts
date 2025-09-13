import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Auth proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Auth proxy request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Auth proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/builder': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/builder/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Builder proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const newPath = req.url?.replace(/^\/api\/builder/, '/api') || req.url;
            console.log('Builder proxy request:', req.method, req.url, '-> http://localhost:8083' + newPath);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Builder proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/ecommerce': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ecommerce/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('E-commerce proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const newPath = req.url?.replace(/^\/api\/ecommerce/, '/api') || req.url;
            console.log('E-commerce proxy request:', req.method, req.url, '-> http://localhost:8082' + newPath);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('E-commerce proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/files': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/files/, '/api/files'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Files proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const newPath = req.url?.replace(/^\/api\/files/, '/api/files') || req.url;
            console.log('Files proxy request:', req.method, req.url, '-> http://localhost:8082' + newPath);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Files proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})

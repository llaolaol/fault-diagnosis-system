import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  base: './', // 确保相对路径，适配各种部署环境
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 优化配置
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'echarts',
      'xlsx'
    ]
  },
  build: {
    // 禁用代码分割以避免循环依赖问题
    rollupOptions: {
      output: {
        // 将所有代码打包成单个文件
        manualChunks: undefined,
        // 确保单个 JS 文件
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    // 启用gzip压缩
    reportCompressedSize: true,
    // 减少打包体积
    minify: 'esbuild',
    // 增加 chunk 大小限制
    chunkSizeWarningLimit: 3000
  },
  server: {
    // 开发服务器优化
    hmr: {
      overlay: false
    },
    host: true,
    port: 3000
  }
})

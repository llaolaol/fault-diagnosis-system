import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

console.log('🚀 应用开始初始化...')

// 异步加载 Element Plus 避免循环依赖
async function initApp() {
  try {
    const app = createApp(App)
    console.log('✅ Vue 应用创建成功')

    // 基础插件
    app.use(createPinia())
    app.use(router)
    console.log('✅ 基础插件加载完成')

    // 异步加载 Element Plus
    const { default: ElementPlus } = await import('element-plus')
    await import('element-plus/dist/index.css')
    app.use(ElementPlus)
    console.log('✅ Element Plus 异步加载完成')

    // 异步加载图标
    const { setupIcons } = await import('./plugins/icons')
    setupIcons(app)
    console.log('✅ 图标异步加载完成')

    app.mount('#app')
    console.log('🎉 应用挂载成功！')
    
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    
    document.getElementById('app')!.innerHTML = `
      <div style="padding: 20px; font-family: Arial; text-align: center;">
        <h2 style="color: #f56c6c;">🚨 应用加载失败</h2>
        <p style="color: #666;">正在尝试简化模式...</p>
        <div style="margin: 20px 0;">
          <button onclick="location.reload()" style="
            background: #409eff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
          ">重新加载</button>
        </div>
        <details style="margin-top: 20px; text-align: left;">
          <summary style="cursor: pointer; color: #909399;">查看错误详情</summary>
          <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; border-radius: 4px; overflow: auto;">${error}</pre>
        </details>
      </div>
    `
  }
}

// 启动应用
initApp()

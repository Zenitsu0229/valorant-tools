// Vue アプリケーションのエントリーポイント
// createApp でアプリを生成し、index.html の #app 要素にマウントする
import { createApp } from 'vue'
import './styles/global.css'
import App from './App.vue'
import router from './router/index.js'

createApp(App).use(router).mount('#app')

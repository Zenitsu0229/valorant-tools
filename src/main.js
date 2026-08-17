import { createApp } from 'vue'
import './styles/global.css'
import App from './App.vue'
import router, { PAGE_META } from './router/index.js'

function updateMeta(path) {
  const meta = PAGE_META[path] ?? PAGE_META['/agent-roulette']
  const url   = meta.canonical

  // 1. タイトル
  document.title = meta.title

  // 2. canonical
  document.querySelector('link[rel="canonical"]')
    ?.setAttribute('href', url)

  // 3. meta description
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', meta.description)

  // 4. hreflang (ja / en / x-default) を現在の URL に統一
  document.querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach(el => el.setAttribute('href', url))

  // 5. OGP / Twitter Card
  document.querySelector('meta[property="og:title"]')
    ?.setAttribute('content', meta.ogTitle)
  document.querySelector('meta[property="og:description"]')
    ?.setAttribute('content', meta.ogDesc)
  document.querySelector('meta[property="og:url"]')
    ?.setAttribute('content', url)
  document.querySelector('meta[name="twitter:title"]')
    ?.setAttribute('content', meta.ogTitle)
  document.querySelector('meta[name="twitter:description"]')
    ?.setAttribute('content', meta.ogDesc)
}

router.afterEach((to) => updateMeta(to.path))

const app = createApp(App)
app.use(router) // これが初回ナビゲーションの解決をトリガーする

// 初回ルート解決を待ってからマウントする。
// これを待たずにマウントすると、直接URLアクセス時（ブックマーク・共有リンク等）に
// route.meta が未解決のまま App.vue の activeTab 初期値が決まってしまい、
// タイトル/SEOメタは正しいのに表示コンテンツだけ既定タブ（Random）のままになる不具合が起きる。
router.isReady().then(() => {
  app.mount('#app')
})

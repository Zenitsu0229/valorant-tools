import { createApp } from 'vue'
import './styles/global.css'
import App from './App.vue'
import router, { BASE_URL } from './router/index.js'

function setMeta(selector, attr, value) {
  document.querySelector(selector)?.setAttribute(attr, value)
}

router.afterEach((to) => {
  const { title, description, ogTitle, ogDesc } = to.meta
  if (!title) return

  const canonical = `${BASE_URL}${to.path}`

  document.title = title
  setMeta('meta[name="description"]',          'content', description)
  setMeta('meta[property="og:title"]',         'content', ogTitle)
  setMeta('meta[property="og:description"]',   'content', ogDesc)
  setMeta('meta[property="og:url"]',           'content', canonical)
  setMeta('meta[name="twitter:title"]',        'content', ogTitle)
  setMeta('meta[name="twitter:description"]',  'content', ogDesc)
  setMeta('link[rel="canonical"]',             'href',    canonical)
})

createApp(App).use(router).mount('#app')

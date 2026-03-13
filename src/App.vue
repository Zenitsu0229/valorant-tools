<script setup>
import { ref } from 'vue'
// Vercel のパフォーマンス計測 SDK
import { injectSpeedInsights } from '@vercel/speed-insights'
injectSpeedInsights()

// ページコンポーネント
import AppHeader      from '@/components/AppHeader.vue'
import AppFooter      from '@/components/AppFooter.vue'
import Agent5         from '@/pages/Agent5/Agent5.vue'
import Agent5v5       from '@/pages/Agent5v5/Agent5v5.vue'
import Map            from '@/pages/Map/Map.vue'
import TeamSplit      from '@/pages/TeamSplit/TeamSplit.vue'
import Contact        from '@/pages/Contact/Contact.vue'
import PrivacyPolicy  from '@/pages/Legal/PrivacyPolicy.vue'
import TermsOfService from '@/pages/Legal/TermsOfService.vue'
import CookiePolicy   from '@/pages/Legal/CookiePolicy.vue'
import '@/pages/Legal/Legal.css'

// ナビゲーションタブ定義（key: 内部識別子, label: 表示名）
const tabs = [
  { key: 'agent5',    label: 'Random'  },
  { key: 'agent5v5',  label: 'Custom'  },
  { key: 'map',       label: 'Map'     },
  { key: 'teamsplit', label: 'Team'    },
  { key: 'contact',   label: 'Contact' },
]

// 現在アクティブなタブ（デフォルト: ランダムピック）
const activeTab = ref('agent5')

// 表示中の法的ページ（null = 非表示, 'privacy' | 'terms' | 'cookie'）
const legalPage = ref(null)

// フッターのリーガルリンクをクリックしたときの処理
// Contact タブに切り替えてからページトップへスクロールし、法的ページを表示する
function openLegal(page) {
  legalPage.value = page
  activeTab.value = 'contact' // 法的ページを閉じたときに Contact タブへ戻るように設定
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 法的ページを閉じる（モーダルを非表示にするだけ）
function closeLegal() {
  legalPage.value = null
}
</script>

<template>
  <!-- スティッキーヘッダー + タブナビゲーション -->
  <AppHeader :tabs="tabs" :activeTab="activeTab" @update:activeTab="activeTab = $event" />

  <main>
    <!-- 法的ページ表示中はタブコンテンツを非表示にしてこちらを表示 -->
    <template v-if="legalPage">
      <PrivacyPolicy
        v-if="legalPage === 'privacy'"
        @close="closeLegal"
        @changePage="openLegal"
      />
      <TermsOfService
        v-else-if="legalPage === 'terms'"
        @close="closeLegal"
      />
      <CookiePolicy
        v-else-if="legalPage === 'cookie'"
        @close="closeLegal"
      />
    </template>

    <!-- 通常のタブコンテンツ（v-show で DOM を維持しつつ表示切り替え） -->
    <template v-else>
      <Agent5   v-show="activeTab === 'agent5'" />
      <Agent5v5 v-show="activeTab === 'agent5v5'" />
      <Map      v-show="activeTab === 'map'" />
      <!-- TeamSplit から Custom タブへの遷移イベントを受け取る -->
      <TeamSplit v-show="activeTab === 'teamsplit'" @go-custom="activeTab = 'agent5v5'" />
      <Contact   v-show="activeTab === 'contact'" />
    </template>
  </main>

  <!-- フッター（法的ページのリンクを showLegal イベントで通知） -->
  <AppFooter @showLegal="openLegal" />
</template>

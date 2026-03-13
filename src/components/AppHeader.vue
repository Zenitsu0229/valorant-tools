<script setup>
// 親コンポーネント（App.vue）から受け取るプロパティ
defineProps({
  activeTab: String, // 現在アクティブなタブキー
  tabs: Array,       // タブ定義配列 { key: string, label: string }[]
})

// タブクリック時に親へ通知するイベント（v-model パターン）
defineEmits(['update:activeTab'])
</script>

<template>
  <div class="sticky-top">
    <!-- サイトヘッダー（ロゴ・サブタイトル・Betaバッジ） -->
    <header class="header">
      <div class="header__left">
        <div class="header__logo">VAL<span class="header__slash">//</span>RANDOM</div>
        <div class="header__subtitle">VALORANT ランダムピック</div>
      </div>
      <div class="header__right">
        <div class="header__badge">Beta 0.0.1</div>
      </div>
    </header>

    <!-- タブナビゲーション（クリックで activeTab を更新） -->
    <nav class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === tab.key }"
        @click="$emit('update:activeTab', tab.key)"
      >{{ tab.label }}</button>
    </nav>
  </div>
</template>

<style scoped>
/* ロゴの「//」をパルスアニメーションで点滅させる */
@keyframes slashPulse {
  0%, 100% { opacity: 1; text-shadow: none; }
  50%       { opacity: 0.7; text-shadow: 0 0 12px rgba(255, 70, 85, 0.8); }
}

.header__slash {
  color: var(--red);
  animation: slashPulse 3s ease-in-out infinite;
  display: inline-block;
}
</style>

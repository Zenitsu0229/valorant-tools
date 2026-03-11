<script setup>
import { ref } from 'vue'
import AgentTab from './pages/AgentTab/AgentTab.vue'
import MapTab from './pages/MapTab/MapTab.vue'

const tabs = [
  { key: 'agent', label: 'エージェント' },
  { key: 'map',   label: 'マップ' },
]

const activeTab = ref('agent')
</script>

<template>
  <header class="header">
    <div>
      <div class="header__logo">VAL<span>//</span>RANDOM</div>
      <div class="header__subtitle">VALORANT ランダムピック</div>
    </div>
    <div class="header__badge">Vue 3</div>
  </header>

  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-btn"
      :class="{ 'tab-btn--active': activeTab === tab.key }"
      @click="activeTab = tab.key"
    >{{ tab.label }}</button>
  </div>

  <main>
    <AgentTab v-if="activeTab === 'agent'" />
    <MapTab   v-if="activeTab === 'map'" />
  </main>
</template>

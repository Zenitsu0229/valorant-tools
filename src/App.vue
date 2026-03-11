<script setup>
import { ref } from 'vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import Agent5   from './pages/Agent5/Agent5.vue'
import Agent5v5 from './pages/Agent5v5/Agent5v5.vue'
import Map      from './pages/Map/Map.vue'

const tabs = [
  { key: 'agent5',   label: 'competitive' },
  { key: 'agent5v5', label: 'custom' },
  { key: 'map',      label: 'Map' },
]

const activeTab = ref('agent5')
</script>

<template>
  <div class="sticky-top">
    <header class="header">
      <div>
        <div class="header__logo">VAL<span>//</span>RANDOM</div>
        <div class="header__subtitle">VALORANT ランダムピック</div>
      </div>
      <div class="header__badge">Beta 0.0.1</div>
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
  </div>

  <main>
    <Agent5   v-show="activeTab === 'agent5'" />
    <Agent5v5 v-show="activeTab === 'agent5v5'" />
    <Map      v-show="activeTab === 'map'" />
  </main>

  <SpeedInsights />
</template>

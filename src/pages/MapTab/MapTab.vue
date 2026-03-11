<script setup>
import { ref, reactive } from 'vue'
import { MAPS } from '../../constants/maps'
import './MapTab.css'

const maps      = reactive(MAPS.map(m => ({ ...m, excluded: false })))
const result    = ref(null)
const resultKey = ref(0)
const error     = ref('')

function toggleMap(name) {
  const map = maps.find(m => m.name === name)
  if (map) map.excluded = !map.excluded
}

function rollMap() {
  error.value = ''
  const pool = maps.filter(m => !m.excluded)
  if (pool.length === 0) {
    error.value = 'マップを1つ以上残してください'
    return
  }
  result.value = pool[Math.floor(Math.random() * pool.length)]
  resultKey.value++
}
</script>

<template>
  <div>
    <h1 class="section-title">マップ ランダム選択</h1>
    <p class="section-desc">除外するマップをクリックして、残りからランダムに1つ選びます</p>

    <!-- マップカードグリッド -->
    <div class="map-grid">
      <div
        v-for="map in maps"
        :key="map.name"
        class="map-card"
        :class="{ 'map-card--excluded': map.excluded }"
        @click="toggleMap(map.name)"
      >
        <!-- スプラッシュ背景 -->
        <img class="map-card__img" :src="map.splash" :alt="map.name" loading="lazy" />

        <!-- 除外オーバーレイ -->
        <div class="map-card__overlay" />

        <!-- 除外バッジ -->
        <div v-if="map.excluded" class="map-card__excluded-badge">EXCLUDED</div>

        <!-- テキスト -->
        <div class="map-card__info">
          <div class="map-card__name">{{ map.name }}</div>
          <div class="map-card__sub">{{ map.sub }}</div>
        </div>
      </div>
    </div>

    <div v-if="error" class="notice">{{ error }}</div>

    <button class="btn-primary" @click="rollMap">
      🎯 マップをランダムに選ぶ
    </button>

    <!-- 結果 -->
    <div v-if="result" class="result-area">
      <div class="result-title">— 結果 —</div>
      <div class="map-result" :key="resultKey">
        <img class="map-result__img" :src="result.splash" :alt="result.name" />
        <div class="map-result__overlay" />
        <div class="map-result__content">
          <div class="map-result__label">TODAY'S MAP</div>
          <div class="map-result__name">{{ result.name }}</div>
          <div class="map-result__sub">{{ result.sub }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

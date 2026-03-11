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
    <p class="section-desc">
      除外するマップをタップして、残りからランダムに1つ選びます
    </p>

    <!-- マップ選択 -->
    <div class="card">
      <div class="input-label" style="margin-bottom: 12px">除外するマップ（タップで除外）</div>
      <div class="map-grid">
        <div
          v-for="map in maps"
          :key="map.name"
          class="map-chip"
          :class="{ 'map-chip--excluded': map.excluded }"
          @click="toggleMap(map.name)"
        >{{ map.name }}</div>
      </div>
    </div>

    <div v-if="error" class="notice">{{ error }}</div>

    <button class="btn-primary" @click="rollMap">
      🎯 マップをランダムに選ぶ
    </button>

    <!-- 結果 -->
    <div v-if="result" class="result-area">
      <div class="result-title">— 結果 —</div>
      <div class="map-result-big" :key="resultKey">
        <div class="map-result-big__label">TODAY'S MAP</div>
        <div class="map-result-big__name">{{ result.name }}</div>
        <div class="map-result-big__sub">{{ result.sub }}</div>
      </div>
    </div>
  </div>
</template>

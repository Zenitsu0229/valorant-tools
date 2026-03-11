<script setup>
import { ref, reactive, nextTick } from 'vue'
import { MAPS } from '../../constants/maps'
import './Map.css'

const maps      = reactive(MAPS.map(m => ({ ...m, excluded: false })))
const result    = ref(null)
const resultKey = ref(0)
const error     = ref('')

// --- マッププリセット ---
const COMPETITIVE_MAPS = new Set(['Abyss', 'Bind', 'Breeze', 'Corrode', 'Haven', 'Pearl', 'Split'])
const UNPOPULAR_MAPS   = new Set(['Breeze', 'Fracture', 'Abyss', 'Icebox'])

function setCompetitiveOnly() {
  if (isRolling.value) return
  maps.forEach(m => { m.excluded = !COMPETITIVE_MAPS.has(m.name) })
}

function removeUnpopular() {
  if (isRolling.value) return
  UNPOPULAR_MAPS.forEach(name => {
    const map = maps.find(m => m.name === name)
    if (map) map.excluded = true
  })
}

function resetMaps() {
  if (isRolling.value) return
  maps.forEach(m => { m.excluded = false })
}

// --- ルーレット状態 ---
const isRolling   = ref(false)
const rollingMap  = ref(null)
const isRevealing = ref(false)

// --- スクロール用 ref ---
const rouletteAreaRef = ref(null)
const resultAreaRef   = ref(null)

function scrollTo(el) {
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function toggleMap(name) {
  if (isRolling.value) return
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

  const finalMap = pool[Math.floor(Math.random() * pool.length)]
  isRolling.value   = true
  isRevealing.value = false
  result.value      = null
  nextTick(() => scrollTo(rouletteAreaRef.value))

  const TOTAL_STEPS = 22

  function step(count) {
    if (count >= TOTAL_STEPS) {
      rollingMap.value  = finalMap
      isRevealing.value = true
      setTimeout(() => {
        isRolling.value   = false
        isRevealing.value = false
        result.value      = finalMap
        resultKey.value++
        nextTick(() => scrollTo(resultAreaRef.value))
      }, 600)
      return
    }

    rollingMap.value = MAPS[Math.floor(Math.random() * MAPS.length)]

    const progress = count / TOTAL_STEPS
    const delay    = 60 + Math.pow(progress, 2.2) * 640

    setTimeout(() => step(count + 1), delay)
  }

  step(0)
}
</script>

<template>
  <div>
    <h1 class="section-title">マップ ランダム選択</h1>
    <p class="section-desc">除外するマップをクリックして、残りからランダムに1つ選びます</p>

    <!-- プリセット -->
    <div class="map-preset-bar">
      <button class="map-preset-btn map-preset-btn--comp" @click="setCompetitiveOnly" :disabled="isRolling">
        <span class="map-preset-btn__icon">⚔</span> コンペティティブのみ
      </button>
      <button class="map-preset-btn map-preset-btn--unpop" @click="removeUnpopular" :disabled="isRolling">
        <span class="map-preset-btn__icon">✕</span> 不人気マップを除外
      </button>
      <button class="map-preset-btn map-preset-btn--reset" @click="resetMaps" :disabled="isRolling">
        <span class="map-preset-btn__icon">↺</span> リセット
      </button>
    </div>

    <!-- マップカードグリッド -->
    <div class="map-grid">
      <div
        v-for="map in maps"
        :key="map.name"
        class="map-card"
        :class="{ 'map-card--excluded': map.excluded, 'map-card--disabled': isRolling }"
        @click="toggleMap(map.name)"
      >
        <img class="map-card__img" :src="map.splash" :alt="map.name" loading="lazy" />
        <div class="map-card__overlay" />
        <div v-if="map.excluded" class="map-card__excluded-badge">EXCLUDED</div>
        <div class="map-card__info">
          <div class="map-card__name">{{ map.name }}</div>
          <div class="map-card__sub">{{ map.sub }}</div>
        </div>
      </div>
    </div>

    <div v-if="error" class="notice">{{ error }}</div>

    <button class="btn-primary" @click="rollMap" :disabled="isRolling">
      {{ isRolling ? 'ROLLING...' : '🎯 マップをランダムに選ぶ' }}
    </button>

    <!-- ルーレット中 / 確定演出 -->
    <div v-if="isRolling && rollingMap" class="roulette-area" ref="rouletteAreaRef">
      <div class="roulette-label">— ROLLING —</div>
      <div class="roulette-display" :class="{ 'roulette-display--reveal': isRevealing }">
        <img class="roulette-display__img" :src="rollingMap.splash" :alt="rollingMap.name" />
        <div class="roulette-display__overlay" />
        <div class="roulette-display__content">
          <div class="roulette-display__name" :class="{ 'roulette-display__name--reveal': isRevealing }">
            {{ rollingMap.name }}
          </div>
          <div v-if="isRevealing" class="roulette-display__sub">{{ rollingMap.sub }}</div>
        </div>
        <div v-if="isRevealing" class="roulette-flash" />
      </div>
    </div>

    <!-- 確定結果 -->
    <div v-if="result && !isRolling" class="result-area" ref="resultAreaRef">
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

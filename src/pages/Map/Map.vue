<script setup>
import { ref, reactive, nextTick } from 'vue'
import { MAPS } from '@/constants/maps'
import './Map.css'

// MAPS をリアクティブにコピーして excluded フラグを追加（元の定数を汚さないために展開コピー）
const maps      = reactive(MAPS.map(m => ({ ...m, excluded: false })))
const result    = ref(null)  // 確定したマップ
const resultKey = ref(0)     // 結果カードの再描画用キー（アニメーションを再実行するために使用）
const error     = ref('')

// ---- マッププリセット ----
// コンペティティブで使用されるマップ
const COMPETITIVE_MAPS = new Set(['Abyss', 'Bind', 'Breeze', 'Corrode', 'Haven', 'Pearl', 'Split'])
// 不人気とされるマップ（環境による）
const UNPOPULAR_MAPS   = new Set(['Breeze', 'Fracture', 'Abyss', 'Icebox'])

// コンペティティブマップのみを残し、他を除外
function setCompetitiveOnly() {
  if (isRolling.value) return
  maps.forEach(m => { m.excluded = !COMPETITIVE_MAPS.has(m.name) })
}

// 不人気マップを除外（既に除外されているマップはそのまま）
function removeUnpopular() {
  if (isRolling.value) return
  UNPOPULAR_MAPS.forEach(name => {
    const map = maps.find(m => m.name === name)
    if (map) map.excluded = true
  })
}

// 全除外を解除してリセット
function resetMaps() {
  if (isRolling.value) return
  maps.forEach(m => { m.excluded = false })
}

// ---- ルーレット状態 ----
const isRolling   = ref(false) // ルーレット中フラグ
const rollingMap  = ref(null)  // ルーレット中に表示するマップ
const isRevealing = ref(false) // 確定演出中フラグ（スローダウン後のズームイン）

// DOM 参照（スクロール制御）
const rouletteAreaRef = ref(null)
const resultAreaRef   = ref(null)

function scrollTo(el) {
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// マップカードクリックで除外/除外解除を切り替え
function toggleMap(name) {
  if (isRolling.value) return
  const map = maps.find(m => m.name === name)
  if (map) map.excluded = !map.excluded
}

// ---- マップ抽選 ----
function rollMap() {
  if (isRolling.value) return
  error.value = ''

  const pool = maps.filter(m => !m.excluded)
  if (pool.length === 0) {
    error.value = 'マップを1つ以上残してください'
    return
  }

  const finalMap    = pool[Math.floor(Math.random() * pool.length)]
  isRolling.value   = true
  isRevealing.value = false
  result.value      = null
  nextTick(() => scrollTo(rouletteAreaRef.value))

  // ルーレット演出定数
  const TOTAL_STEPS    = 28   // ランダム切り替えの回数
  const REVEAL_HOLD_MS = 900  // 確定演出を表示する時間（ms）

  /**
   * 再帰的な setTimeout でルーレット表現
   * count が TOTAL_STEPS に達したら確定演出に切り替える
   * progress（0〜1）に応じて遅延時間を累乗的に増やすことでスローダウン効果
   */
  function step(count) {
    if (count >= TOTAL_STEPS) {
      rollingMap.value  = finalMap
      isRevealing.value = true  // 確定演出（ズームイン・バースト）開始
      setTimeout(() => {
        isRolling.value   = false
        isRevealing.value = false
        result.value      = finalMap
        resultKey.value++  // キーを変えることで結果カードのアニメーションを再実行
        nextTick(() => scrollTo(resultAreaRef.value))
      }, REVEAL_HOLD_MS)
      return
    }

    // 全マップからランダムに切り替え（除外マップも表示対象にしてルーレット感を演出）
    rollingMap.value = MAPS[Math.floor(Math.random() * MAPS.length)]

    const progress = count / TOTAL_STEPS
    const delay    = 45 + Math.pow(progress, 2.4) * 700 // 徐々に遅くなる
    setTimeout(() => step(count + 1), delay)
  }

  step(0)
}
</script>

<template>
  <div>
    <h1 class="section-title">VALORANTマップ ランダム・ルーレット</h1>
    <p class="section-desc">プレイするマップをルーレットでランダム選択。除外機能・コンペティティブマップ絞り込み対応。</p>

    <!-- マッププリセットボタン -->
    <div class="map-preset-bar">
      <button class="map-preset-btn map-preset-btn--comp"  @click="setCompetitiveOnly" :disabled="isRolling">
        <span class="map-preset-btn__icon">⚔</span> コンペティティブのみ
      </button>
      <button class="map-preset-btn map-preset-btn--unpop" @click="removeUnpopular"    :disabled="isRolling">
        <span class="map-preset-btn__icon">✕</span> 不人気マップを除外
      </button>
      <button class="map-preset-btn map-preset-btn--reset" @click="resetMaps"          :disabled="isRolling">
        <span class="map-preset-btn__icon">↺</span> リセット
      </button>
    </div>

    <!-- マップカードグリッド（クリックで除外切り替え） -->
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
        <!-- 除外済みのマップにはバッジを表示 -->
        <div v-if="map.excluded" class="map-card__excluded-badge">EXCLUDED</div>
        <div class="map-card__info">
          <div class="map-card__name">{{ map.name }}</div>
          <div class="map-card__sub">{{ map.sub }}</div>
        </div>
      </div>
    </div>

    <div v-if="error" class="notice">{{ error }}</div>

    <!-- 抽選ボタン -->
    <button class="btn-primary" @click="rollMap" :disabled="isRolling">
      {{ isRolling ? '🎯 ROLLING...' : '🎯 マップ抽選開始' }}
    </button>

    <!-- ルーレット演出エリア（isRolling 中かつ rollingMap がある場合のみ表示） -->
    <div v-if="isRolling && rollingMap" class="roulette-area" ref="rouletteAreaRef">
      <div class="roulette-label">
        <span class="roulette-label__dot"></span>
        SCANNING MAPS
        <span class="roulette-label__dot"></span>
      </div>
      <div
        class="roulette-display"
        :class="{ 'roulette-display--reveal': isRevealing, 'roulette-display--rolling': !isRevealing }"
      >
        <img class="roulette-display__img" :src="rollingMap.splash" :alt="rollingMap.name" />
        <div class="roulette-display__overlay" />

        <!-- ルーレット中のスキャンラインとグリッチ演出 -->
        <template v-if="!isRevealing">
          <div class="roulette-scanlines"></div>
          <div
            v-for="n in 3" :key="n"
            class="roulette-glitch-bar"
            :style="{ top: `${n * 28}%`, animationDelay: `${(n - 1) * 0.08}s` }"
          ></div>
        </template>

        <!-- 確定演出のバースト・ラインエフェクト -->
        <template v-if="isRevealing">
          <div class="roulette-confirm-burst"></div>
          <div class="roulette-confirm-lines"></div>
        </template>

        <div class="roulette-display__content">
          <div
            class="roulette-display__name"
            :class="{ 'roulette-display__name--reveal': isRevealing, 'roulette-display__name--rolling': !isRevealing }"
          >{{ rollingMap.name }}</div>
          <div v-if="isRevealing" class="roulette-display__sub">{{ rollingMap.sub }}</div>
          <div v-if="isRevealing" class="roulette-confirm-label">— MAP CONFIRMED —</div>
        </div>
        <div v-if="isRevealing" class="roulette-flash" />
      </div>
    </div>

    <!-- 確定結果エリア（:key を使って再表示時にアニメーションを再実行） -->
    <div v-if="result && !isRolling" class="result-area" ref="resultAreaRef">
      <div class="result-title">— 結果 —</div>
      <div class="map-result" :key="resultKey">
        <img class="map-result__img" :src="result.splash" :alt="result.name" />
        <div class="map-result__overlay" />
        <div class="map-result__scanlines"></div>
        <div class="map-result__content">
          <div class="map-result__label">TODAY'S MAP</div>
          <div class="map-result__name">{{ result.name }}</div>
          <div class="map-result__sub">{{ result.sub }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

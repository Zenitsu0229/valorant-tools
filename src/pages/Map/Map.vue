<script setup>
import { ref, reactive, nextTick } from 'vue'
import { MAPS } from '@/constants/maps'
import './Map.css'

// MAPS をリアクティブにコピーして excluded フラグを追加（元の定数を汚さないために展開コピー）
const maps      = reactive(MAPS.map(m => ({ ...m, excluded: false })))
const result    = ref(null)  // 確定したマップ（通常モード）
const resultKey = ref(0)     // 結果カードの再描画用キー（アニメーションを再実行するために使用）
const error     = ref('')

// ---- マッププリセット ----
// コンペティティブで使用されるマップ（Patch 13.00 / Act 4 時点）
const COMPETITIVE_MAPS = new Set(['Ascent', 'Breeze', 'Haven', 'Lotus', 'Split', 'Summit', 'Sunset'])
// 不人気とされるマップ（環境による）
const UNPOPULAR_MAPS   = new Set(['Breeze', 'Fracture', 'Abyss', 'Icebox'])

// コンペティティブマップのみを残し、他を除外（まず全リセットしてから適用）
function setCompetitiveOnly() {
  if (isRolling.value) return
  maps.forEach(m => { m.excluded = !COMPETITIVE_MAPS.has(m.name) })
}

// 不人気マップを除外（まず全リセットしてから対象マップを除外）
function removeUnpopular() {
  if (isRolling.value) return
  maps.forEach(m => { m.excluded = false })
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

// ---- BO3 状態 ----
const isBo3           = ref(false) // BO3モードフラグ
const bo3Results      = ref([])    // BO3の確定マップ（最大3つ）
const bo3CurrentRound = ref(0)     // 現在ロール中のラウンド（0=1st, 1=2nd, 2=3rd）

// BO3モードのトグル
function toggleBo3() {
  if (isRolling.value) return
  isBo3.value = !isBo3.value
}

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

// ---- 単体ルーレット演出 ----
// finalMap を確定として演出し、完了後に onComplete を呼ぶ
// bo3: true のとき演出を短縮（ステップ数・ホールド時間を削減）
function rollSingle(finalMap, onComplete, bo3 = false) {
  isRevealing.value = false
  nextTick(() => scrollTo(rouletteAreaRef.value))

  const TOTAL_STEPS    = bo3 ? 10 : 28   // BO3は短縮（合計約2秒）
  const REVEAL_HOLD_MS = bo3 ? 400 : 900 // BO3は確定演出も短め
  const MAX_DELAY      = bo3 ? 350 : 700 // BO3はスローダウン幅も縮小

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
        isRevealing.value = false
        onComplete()
      }, REVEAL_HOLD_MS)
      return
    }

    // 全マップからランダムに切り替え（除外マップも表示対象にしてルーレット感を演出）
    rollingMap.value = MAPS[Math.floor(Math.random() * MAPS.length)]

    const progress = count / TOTAL_STEPS
    const delay    = 45 + Math.pow(progress, 2.4) * MAX_DELAY // 徐々に遅くなる
    setTimeout(() => step(count + 1), delay)
  }

  step(0)
}

// ---- BO3 シーケンシャルロール ----
// finalMaps の index 番目から順番にルーレットを実行し、全完了後に結果エリアへスクロール
function rollSequential(finalMaps, index) {
  bo3CurrentRound.value = index
  rollSingle(finalMaps[index], () => {
    bo3Results.value = [...bo3Results.value, finalMaps[index]]
    if (index + 1 < finalMaps.length) {
      // 次のラウンドへ（少し間を置いてから開始）
      setTimeout(() => rollSequential(finalMaps, index + 1), 300)
    } else {
      // 全ラウンド完了
      isRolling.value = false
      resultKey.value++
      nextTick(() => scrollTo(resultAreaRef.value))
    }
  }, true)
}

// ---- マップ抽選 ----
function rollMap() {
  if (isRolling.value) return
  error.value      = ''
  result.value     = null
  bo3Results.value = []

  const pool = maps.filter(m => !m.excluded)

  if (isBo3.value) {
    if (pool.length < 3) {
      error.value = 'BO3モードではマップを3つ以上残してください'
      return
    }
    // pool をシャッフルして重複なしで3つ選択
    const shuffled  = [...pool].sort(() => Math.random() - 0.5)
    const finalMaps = shuffled.slice(0, 3)
    isRolling.value = true
    rollSequential(finalMaps, 0)
  } else {
    if (pool.length === 0) {
      error.value = 'マップを1つ以上残してください'
      return
    }
    const finalMap  = pool[Math.floor(Math.random() * pool.length)]
    isRolling.value = true
    rollSingle(finalMap, () => {
      isRolling.value = false
      result.value    = finalMap
      resultKey.value++
      nextTick(() => scrollTo(resultAreaRef.value))
    })
  }
}
</script>

<template>
  <div>
    <h1 class="section-title">VALORANTマップ ルーレット | コンペ専用フィルター対応【無料】</h1>
    <p class="section-desc">VALORANTのマップをルーレットでランダム選択。コンペティティブマップのみ絞り込み・除外マップ指定・BO3対応。スクリムや内輪カスタムゲームのマップ決めに最適。</p>

    <!-- マッププリセットボタン / BO3モード切り替え -->
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
      <div class="map-preset-separator"></div>
      <button
        class="map-preset-btn"
        :class="isBo3 ? 'map-preset-btn--bo3-active' : 'map-preset-btn--bo3'"
        @click="toggleBo3"
        :disabled="isRolling"
      >
        <span class="map-preset-btn__icon">⚡</span> BO3モード
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
      {{ isRolling
        ? (isBo3 ? `🎯 ROLLING... (${['1st','2nd','3rd'][bo3CurrentRound]})` : '🎯 ROLLING...')
        : (isBo3 ? '🎯 BO3 マップ抽選開始' : '🎯 マップ抽選開始') }}
    </button>

    <!-- ルーレット演出エリア（isRolling 中かつ rollingMap がある場合のみ表示） -->
    <div v-if="isRolling && rollingMap" class="roulette-area" ref="rouletteAreaRef">
      <div class="roulette-label">
        <span class="roulette-label__dot"></span>
        {{ isBo3 ? `${['1ST', '2ND', '3RD'][bo3CurrentRound]} MAP — SCANNING` : 'SCANNING MAPS' }}
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

    <!-- 確定結果エリア（通常モード） -->
    <div v-if="result && !isRolling && !isBo3" class="result-area" ref="resultAreaRef">
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

    <!-- BO3 結果エリア（1枚ずつ確定するたびに追加表示） -->
    <div v-if="isBo3 && bo3Results.length > 0" class="result-area" ref="resultAreaRef">
      <div class="result-title">— BO3 結果 —</div>
      <div class="bo3-results">
        <div
          v-for="(map, i) in bo3Results"
          :key="resultKey + '-' + i"
          class="bo3-result-item"
        >
          <div class="bo3-result-round">{{ ['1st', '2nd', '3rd'][i] }}</div>
          <div class="map-result">
            <img class="map-result__img" :src="map.splash" :alt="map.name" />
            <div class="map-result__overlay" />
            <div class="map-result__scanlines"></div>
            <div class="map-result__content">
              <div class="map-result__label">{{ ['1ST MAP', '2ND MAP', '3RD MAP'][i] }}</div>
              <div class="map-result__name">{{ map.name }}</div>
              <div class="map-result__sub">{{ map.sub }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { HANDICAPS } from '@/constants/handicaps'
import { useSharedTeam } from '@/composables/useSharedTeam'
import './TeamSplit.css'

const emit = defineEmits(['go-custom'])
const { setTeams } = useSharedTeam()

const MIN_PLAYERS = 2
const MAX_PLAYERS = 10

const TEAM_RANKS = [
  { key: 'bronze',   label: 'ブロンズ',   value: 5,  tier: 'bronze'   },
  { key: 'gold',     label: 'ゴールド',   value: 11, tier: 'gold'     },
  { key: 'diamond',  label: 'ダイヤ',     value: 17, tier: 'diamond'  },
  { key: 'immortal', label: 'イモータル', value: 23, tier: 'immortal' },
]
const RANK_MAP = Object.fromEntries(TEAM_RANKS.map(r => [r.key, r]))

const makePlayer = (n) => ({
  name: '',
  placeholder: `Player ${n}`,
  rank: 'bronze',
})

const MODES = [
  { key: 'balance',  label: '⚖ バランス', desc: 'ランク差を最小化してチーム分け' },
  { key: 'flat',     label: '🎲 ランダム', desc: 'ランクを無視して完全ランダム分け' },
  { key: 'handicap', label: '⚔ ハンデ',   desc: '強チーム vs 弱チームに意図的に偏らせる' },
]

const players   = reactive(Array.from({ length: 10 }, (_, i) => makePlayer(i + 1)))
const mode      = ref('balance')
const result    = ref(null)
const resultKey = ref(0)

// --- 演出用ステート ---
const isRolling          = ref(false)
const showResult         = ref(false)
const displayHandicap    = ref(null)  // スロット中 / 確定後に表示
const isHandicapRolling  = ref(false) // スロット中フラグ
const handicapLocked     = ref(false) // 確定フラグ

const resultAreaRef = ref(null)
const playerListRef = ref(null)

const showBulkInput = ref(false)
const bulkNames     = ref(Array.from({ length: MAX_PLAYERS }, () => ''))

function toggleBulkInput() {
  showBulkInput.value = !showBulkInput.value
  if (showBulkInput.value) {
    bulkNames.value = Array.from({ length: MAX_PLAYERS }, () => '')
  }
}

function applyBulk() {
  const names = bulkNames.value.map(n => n.trim()).filter(n => n)
  if (!names.length) return
  const newSize = Math.min(Math.max(names.length, MIN_PLAYERS), MAX_PLAYERS)
  while (players.length < newSize) players.push(makePlayer(players.length + 1))
  while (players.length > newSize) players.pop()
  names.forEach((name, i) => { if (i < players.length) players[i].name = name })
  bulkNames.value = Array.from({ length: MAX_PLAYERS }, () => '')
  showBulkInput.value = false
}

function onBulkPaste(e, startIdx) {
  const text = e.clipboardData?.getData('text') ?? ''
  const lines = text.split('\n').map(l => l.replace(/^\d+人目[：:]\s*/, '').trim())
  if (lines.length <= 1) return
  e.preventDefault()
  lines.forEach((name, i) => {
    const idx = startIdx + i
    if (idx < MAX_PLAYERS) bulkNames.value[idx] = name
  })
  nextTick(applyBulk)
}

function focusNextInput(idx) {
  const inputs = playerListRef.value?.querySelectorAll('input[type="text"]')
  if (inputs?.[idx + 1]) inputs[idx + 1].focus()
}

function scrollTo(el) {
  if (!el) return
  const headerH = document.querySelector('.sticky-top')?.offsetHeight ?? 0
  const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12
  window.scrollTo({ top, behavior: 'smooth' })
}

// --- プレイヤー追加・削除 ---
function addPlayer() {
  if (players.length >= MAX_PLAYERS) return
  players.push(makePlayer(players.length + 1))
}
function removePlayer() {
  if (players.length <= MIN_PLAYERS) return
  players.pop()
}

// --- チームサイズ ---
const teamSizes = computed(() => ({
  a: Math.ceil(players.length / 2),
  b: Math.floor(players.length / 2),
}))

// --- バランス分け ---
function balancedSplit(playerData) {
  const sizeA = Math.ceil(playerData.length / 2)
  const candidates = []
  for (let t = 0; t < 500; t++) {
    const shuffled = [...playerData].sort(() => Math.random() - 0.5)
    const a = shuffled.slice(0, sizeA)
    const b = shuffled.slice(sizeA)
    candidates.push({ a, b, diff: Math.abs(
      a.reduce((s, p) => s + p.rankValue, 0) -
      b.reduce((s, p) => s + p.rankValue, 0)
    )})
  }
  candidates.sort((x, y) => x.diff - y.diff)
  const top = candidates.slice(0, Math.min(20, candidates.length))
  return top[Math.floor(Math.random() * top.length)]
}

// --- フラット分け ---
function flatSplit(playerData) {
  const sizeA    = Math.ceil(playerData.length / 2)
  const shuffled = [...playerData].sort(() => Math.random() - 0.5)
  const a = shuffled.slice(0, sizeA)
  const b = shuffled.slice(sizeA)
  return { a, b, diff: Math.abs(
    a.reduce((s, p) => s + p.rankValue, 0) -
    b.reduce((s, p) => s + p.rankValue, 0)
  )}
}

// --- ハンデ分け ---
function handicapSplit(playerData) {
  const sizeA = Math.ceil(playerData.length / 2)
  const sorted = [...playerData].sort((a, b) =>
    b.rankValue !== a.rankValue ? b.rankValue - a.rankValue : Math.random() - 0.5
  )
  const a = sorted.slice(0, sizeA)
  const b = sorted.slice(sizeA)
  return { a, b, diff: Math.abs(
    a.reduce((s, p) => s + p.rankValue, 0) -
    b.reduce((s, p) => s + p.rankValue, 0)
  )}
}

// --- ハンデスロット演出 ---
function startHandicapSlot(final) {
  isHandicapRolling.value = true
  handicapLocked.value    = false
  const STEPS = 24

  function step(count) {
    if (count >= STEPS) {
      displayHandicap.value   = final
      isHandicapRolling.value = false
      // 少し後に「確定」フラグ
      setTimeout(() => { handicapLocked.value = true }, 80)
      return
    }
    displayHandicap.value = HANDICAPS[Math.floor(Math.random() * HANDICAPS.length)]
    const progress = count / STEPS
    const delay    = 55 + Math.pow(progress, 2.4) * 700
    setTimeout(() => step(count + 1), delay)
  }
  step(0)
}

// --- 平均ランク文字列 ---
function avgRankLabel(team) {
  if (team.length === 0) return '—'
  const avg = team.reduce((s, p) => s + p.rankValue, 0) / team.length
  return TEAM_RANKS.reduce((prev, r) =>
    Math.abs(r.value - avg) < Math.abs(prev.value - avg) ? r : prev
  ).label
}

// --- カスタムページへ遷移してプレイヤー名を引き継ぎ ---
function goToCustom() {
  if (!result.value) return
  setTeams(
    result.value.a.map(p => p.name),
    result.value.b.map(p => p.name),
  )
  emit('go-custom')
}

// --- 分け実行 ---
function splitTeams() {
  if (isRolling.value) return

  // リセット
  isRolling.value         = true
  showResult.value        = false
  result.value            = null
  displayHandicap.value   = null
  isHandicapRolling.value = false
  handicapLocked.value    = false

  const playerData = players.map(p => ({
    name:      p.name.trim() || p.placeholder,
    rank:      p.rank,
    rankValue: RANK_MAP[p.rank].value,
  }))

  setTimeout(() => {
    let split
    if      (mode.value === 'balance')  split = balancedSplit(playerData)
    else if (mode.value === 'handicap') split = handicapSplit(playerData)
    else                                split = flatSplit(playerData)

    const finalHandicap = mode.value === 'handicap'
      ? HANDICAPS[Math.floor(Math.random() * HANDICAPS.length)]
      : null

    split.handicap  = finalHandicap
    result.value    = split
    resultKey.value++
    isRolling.value = false

    // チームを表示
    nextTick(() => {
      showResult.value = true
      scrollTo(resultAreaRef.value)

      // ハンデモードなら少し後にスロット開始
      if (mode.value === 'handicap') {
        setTimeout(() => startHandicapSlot(finalHandicap), 700)
      }
    })
  }, 2400)
}
</script>

<template>
  <div>
    <h1 class="section-title">チームランダム分け</h1>
    <p class="section-desc">プレイヤーとランクを入力してチームをランダム振り分け。バランスモードでランク差を最小化。</p>

    <!-- コントロールバー -->
    <div class="ts-control-bar">
      <div class="ts-count-group">
        <span class="ts-count-label">プレイヤー数</span>
        <div class="size-control">
          <button class="size-btn" @click="removePlayer" :disabled="isRolling || players.length <= MIN_PLAYERS">−</button>
          <span class="size-display">{{ players.length }}<span class="size-max">/{{ MAX_PLAYERS }}</span></span>
          <button class="size-btn" @click="addPlayer" :disabled="isRolling || players.length >= MAX_PLAYERS">＋</button>
        </div>
        <span class="ts-team-info">→ {{ teamSizes.a }}人 vs {{ teamSizes.b }}人</span>
      </div>

      <div class="ts-mode-group">
        <button
          v-for="m in MODES" :key="m.key"
          class="ts-mode-btn"
          :class="[`ts-mode-btn--${m.key}`, { 'ts-mode-btn--active': mode === m.key }]"
          :title="m.desc"
          :disabled="isRolling"
          @click="mode = m.key"
        >{{ m.label }}</button>
      </div>
      <button
        class="bulk-toggle-btn"
        :class="{ 'bulk-toggle-btn--active': showBulkInput }"
        :disabled="isRolling"
        @click="toggleBulkInput"
      >📋 一括入力</button>
    </div>

    <Transition name="bulk-panel">
      <div v-if="showBulkInput" class="bulk-panel">
        <div class="bulk-rows">
          <div v-for="n in MAX_PLAYERS" :key="n" class="bulk-row">
            <span class="bulk-label">{{ n }}人目：</span>
            <input
              class="bulk-input"
              type="text"
              v-model="bulkNames[n - 1]"
              :placeholder="`Player ${n}`"
              maxlength="20"
              :disabled="isRolling"
              @paste="e => onBulkPaste(e, n - 1)"
            />
          </div>
        </div>
        <div class="bulk-actions">
          <button class="bulk-apply-btn" @click="applyBulk" :disabled="isRolling">適用</button>
          <button class="bulk-close-btn" @click="toggleBulkInput">閉じる</button>
          <span class="bulk-hint">貼り付けで自動適用</span>
        </div>
      </div>
    </Transition>

    <!-- プレイヤー入力 -->
    <div class="ts-card">
      <div class="ts-player-list" ref="playerListRef">
        <div v-for="(player, idx) in players" :key="idx" class="ts-player-row">
          <span class="player-num">{{ String(idx + 1).padStart(2, '0') }}</span>
          <input
            class="ts-name-input"
            type="text"
            :placeholder="player.placeholder"
            maxlength="20"
            v-model="player.name"
            :disabled="isRolling"
            @keydown.enter="focusNextInput(idx)"
          />
          <div class="ts-rank-chips">
            <button
              v-for="r in TEAM_RANKS" :key="r.key"
              class="ts-rank-chip"
              :class="[`ts-rank-chip--${r.tier}`, { 'ts-rank-chip--active': player.rank === r.key }]"
              @click="!isRolling && (player.rank = r.key)"
              :disabled="isRolling"
            >{{ r.label }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 抽選ボタン -->
    <button class="btn-primary" :class="{ 'btn-primary--splitting': isRolling }" @click="splitTeams" :disabled="isRolling">
      <span v-if="isRolling" class="ts-splitting-text">
        <span class="ts-splitting-dot">■</span>
        <span class="ts-splitting-dot">■</span>
        <span class="ts-splitting-dot">■</span>
        SPLITTING
      </span>
      <span v-else>⚡ チーム分け開始</span>
    </button>

    <!-- ===== スプリット演出パネル ===== -->
    <Transition name="ts-stage">
      <div v-if="isRolling" class="ts-split-stage">
        <!-- スキャンライン -->
        <div class="ts-split-stage__scanline"></div>

        <!-- タイトル -->
        <div class="ts-split-stage__title">SPLITTING<span class="ts-split-stage__title-sub"> TEAMS</span></div>

        <!-- チーム表示 -->
        <div class="ts-split-stage__teams">
          <div class="ts-split-stage__team ts-split-stage__team--a">TEAM A</div>
          <div class="ts-split-stage__vs">VS</div>
          <div class="ts-split-stage__team ts-split-stage__team--b">TEAM B</div>
        </div>

        <!-- プレイヤー名 -->
        <div class="ts-split-stage__names">
          <span
            v-for="(p, i) in players" :key="i"
            class="ts-split-stage__name"
            :style="{ animationDelay: `${i * 55}ms` }"
          >{{ p.name || p.placeholder }}</span>
        </div>

        <!-- プログレスバー -->
        <div class="ts-split-stage__progress-wrap">
          <div class="ts-split-stage__progress"></div>
        </div>
      </div>
    </Transition>

    <!-- 結果エリア -->
    <div v-if="showResult && result" class="ts-result-area" ref="resultAreaRef" :key="resultKey">
      <div class="result-title">— 結果 —</div>

      <!-- ステータスバー -->
      <div class="ts-balance-bar">
        <span class="ts-balance-label">モード</span>
        <span class="ts-mode-tag" :class="`ts-mode-tag--${mode}`">
          {{ MODES.find(m => m.key === mode)?.label }}
        </span>
        <span class="ts-balance-sep">|</span>
        <span class="ts-balance-label">ランク差</span>
        <span class="ts-balance-value" :class="{ 'ts-balance-value--perfect': result.diff === 0 }">
          {{ result.diff === 0 ? '± 0（完璧）' : `± ${result.diff}` }}
        </span>
        <span v-if="mode === 'handicap'" class="ts-handicap-note">⚔ TEAM A = 強チーム</span>
      </div>

      <!-- チームグリッド -->
      <div class="ts-result-grid">
        <!-- TEAM A -->
        <div class="ts-team-card ts-team-card--a">
          <div class="ts-team-header ts-team-header--a">TEAM A</div>
          <div class="ts-team-body">
            <div
              v-for="(p, i) in result.a" :key="i"
              class="ts-result-player"
              :style="{ animationDelay: `${i * 90}ms` }"
            >
              <span class="ts-result-name">{{ p.name }}</span>
              <span class="ts-rank-badge" :class="`ts-rank-badge--${RANK_MAP[p.rank].tier}`">
                {{ RANK_MAP[p.rank].label }}
              </span>
            </div>
          </div>
          <div class="ts-team-avg">
            <span class="ts-avg-label">平均ランク</span>
            <span class="ts-avg-value">{{ avgRankLabel(result.a) }}</span>
          </div>
        </div>

        <!-- VS -->
        <div class="ts-vs">VS</div>

        <!-- TEAM B -->
        <div class="ts-team-card ts-team-card--b">
          <div class="ts-team-header ts-team-header--b">TEAM B</div>
          <div class="ts-team-body">
            <div
              v-for="(p, i) in result.b" :key="i"
              class="ts-result-player"
              :style="{ animationDelay: `${(result.a.length + i) * 90}ms` }"
            >
              <span class="ts-result-name">{{ p.name }}</span>
              <span class="ts-rank-badge" :class="`ts-rank-badge--${RANK_MAP[p.rank].tier}`">
                {{ RANK_MAP[p.rank].label }}
              </span>
            </div>
          </div>
          <div class="ts-team-avg">
            <span class="ts-avg-label">平均ランク</span>
            <span class="ts-avg-value">{{ avgRankLabel(result.b) }}</span>
          </div>
        </div>
      </div>

      <!-- ハンデスロット -->
      <div v-if="mode === 'handicap' && displayHandicap" class="ts-handicap-wrap">
        <div
          class="ts-handicap-card"
          :class="{
            'ts-handicap-card--rolling': isHandicapRolling,
            'ts-handicap-card--locked':  handicapLocked,
          }"
        >
          <div class="ts-handicap-card__header">
            <span class="ts-handicap-card__icon">{{ displayHandicap.icon }}</span>
            <span class="ts-handicap-card__label">
              {{ isHandicapRolling ? 'DRAWING HANDICAP...' : '強チームへのハンデ 確定' }}
            </span>
            <span class="ts-handicap-card__name">{{ displayHandicap.label }}</span>
          </div>
          <p class="ts-handicap-card__desc" :class="{ 'ts-handicap-card__desc--hidden': isHandicapRolling }">
            {{ displayHandicap.desc }}
          </p>
          <!-- 確定フラッシュ -->
          <div v-if="handicapLocked" class="ts-handicap-card__flash" />
        </div>
      </div>

      <div class="ts-action-bar">
        <button class="ts-retry-btn" @click="splitTeams" :disabled="isRolling || isHandicapRolling">↺ もう一度</button>
        <button class="ts-goto-btn" @click="goToCustom" :disabled="isRolling || isHandicapRolling">⚡ カスタムでランダムピック</button>
      </div>
    </div>

  </div>
</template>

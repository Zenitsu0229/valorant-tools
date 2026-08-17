<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { HANDICAPS } from '@/constants/handicaps'
import { useSharedTeam } from '@/composables/useSharedTeam'
import './TeamSplit.css'

// カスタムページへの遷移イベント（App.vue でタブを切り替える）
const emit = defineEmits(['go-custom'])
// TeamSplit → Agent5v5 へプレイヤー名を渡すための共有状態
const { setTeams } = useSharedTeam()

// プレイヤー数の上限・下限
const MIN_PLAYERS = 2
const MAX_PLAYERS = 10

// TeamSplit で使う簡略ランク（8段階）
// value はチーム分け計算用のポイント（アイアン=1 〜 レディアント=8 の等間隔）
const TEAM_RANKS = [
  { key: 'iron',     label: 'アイアン',     value: 1, tier: 'iron'     },
  { key: 'bronze',   label: 'ブロンズ',     value: 2, tier: 'bronze'   },
  { key: 'silver',   label: 'シルバー',     value: 3, tier: 'silver'   },
  { key: 'gold',     label: 'ゴールド',     value: 4, tier: 'gold'     },
  { key: 'platinum', label: 'プラチナ',     value: 5, tier: 'platinum' },
  { key: 'diamond',  label: 'ダイヤ',       value: 6, tier: 'diamond'  },
  { key: 'immortal', label: 'イモータル',   value: 7, tier: 'immortal' },
  { key: 'radiant',  label: 'レディアント', value: 8, tier: 'radiant'  },
]
// ランクキー → ランクオブジェクトの高速参照マップ
const RANK_MAP = Object.fromEntries(TEAM_RANKS.map(r => [r.key, r]))

// プレイヤーオブジェクトのファクトリ関数
const makePlayer = (n) => ({
  name:        '',
  placeholder: `Player ${n}`,
  rank:        'iron', // デフォルトランク
})

// チーム分けモード定義
const MODES = [
  { key: 'balance',  label: '⚖ バランス', desc: 'ランク差を最小化してチーム分け' },
  { key: 'flat',     label: '🎲 ランダム', desc: 'ランクを無視して完全ランダム分け' },
  { key: 'handicap', label: '⚔ ハンデ',   desc: '強チーム vs 弱チームに意図的に偏らせる' },
]

// ---- 状態管理 ----
const players   = reactive(Array.from({ length: 10 }, (_, i) => makePlayer(i + 1)))
const mode      = ref('balance')
const result    = ref(null)  // 分け結果 { a: [], b: [], diff: number, handicap: object|null }
const resultKey = ref(0)     // 結果の再描画キー

// ---- 演出用ステート ----
const isRolling         = ref(false)  // 分け処理中フラグ（演出中も含む）
const showResult        = ref(false)  // 結果エリアの表示フラグ
const displayHandicap   = ref(null)   // ハンデスロット演出中 / 確定後のハンデ表示
const isHandicapRolling = ref(false)  // ハンデスロット演出中フラグ
const handicapLocked    = ref(false)  // ハンデ確定フラグ（確定フラッシュ演出用）

// DOM 参照
const resultAreaRef = ref(null)
const playerListRef = ref(null)

// ---- 一括入力 ----
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
  bulkNames.value     = Array.from({ length: MAX_PLAYERS }, () => '')
  showBulkInput.value = false
}

// 複数行ペーストを検知して自動適用
function onBulkPaste(e, startIdx) {
  const text  = e.clipboardData?.getData('text') ?? ''
  const lines = text.split('\n').map(l => l.replace(/^\d+人目[：:]\s*/, '').trim())
  if (lines.length <= 1) return
  e.preventDefault()
  lines.forEach((name, i) => {
    const idx = startIdx + i
    if (idx < MAX_PLAYERS) bulkNames.value[idx] = name
  })
  nextTick(applyBulk)
}

// Enter キーで次のフィールドへフォーカス移動
function focusNextInput(idx) {
  const inputs = playerListRef.value?.querySelectorAll('input[type="text"]')
  if (inputs?.[idx + 1]) inputs[idx + 1].focus()
}

// ヘッダー高さを考慮したスムーズスクロール
function scrollTo(el) {
  if (!el) return
  const headerH = document.querySelector('.sticky-top')?.offsetHeight ?? 0
  const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12
  window.scrollTo({ top, behavior: 'smooth' })
}

// ---- プレイヤー追加・削除 ----
function addPlayer() {
  if (players.length >= MAX_PLAYERS) return
  players.push(makePlayer(players.length + 1))
}
function removePlayer() {
  if (players.length <= MIN_PLAYERS) return
  players.pop()
}

// 人数に基づく各チームサイズ（奇数の場合は TEAM A が 1 人多い）
const teamSizes = computed(() => ({
  a: Math.ceil(players.length / 2),
  b: Math.floor(players.length / 2),
}))

// ---- チーム分けアルゴリズム ----

/**
 * バランス分け：500 回試行してランク差が最小の上位 20 件からランダムに1つ選ぶ
 * 完全な最適解ではなくランダム性を残すことで、毎回異なる分け方になる
 */
function balancedSplit(playerData) {
  const sizeA      = Math.ceil(playerData.length / 2)
  const candidates = []
  for (let t = 0; t < 500; t++) {
    const shuffled = [...playerData].sort(() => Math.random() - 0.5)
    const a        = shuffled.slice(0, sizeA)
    const b        = shuffled.slice(sizeA)
    candidates.push({
      a, b,
      diff: Math.abs(
        a.reduce((s, p) => s + p.rankValue, 0) -
        b.reduce((s, p) => s + p.rankValue, 0)
      ),
    })
  }
  // ランク差の小さい順に並べて上位 20 件からランダム選択
  candidates.sort((x, y) => x.diff - y.diff)
  const top = candidates.slice(0, Math.min(20, candidates.length))
  return top[Math.floor(Math.random() * top.length)]
}

/**
 * フラット（ランダム）分け：ランクを無視して完全ランダムにシャッフル
 */
function flatSplit(playerData) {
  const sizeA    = Math.ceil(playerData.length / 2)
  const shuffled = [...playerData].sort(() => Math.random() - 0.5)
  const a        = shuffled.slice(0, sizeA)
  const b        = shuffled.slice(sizeA)
  return {
    a, b,
    diff: Math.abs(
      a.reduce((s, p) => s + p.rankValue, 0) -
      b.reduce((s, p) => s + p.rankValue, 0)
    ),
  }
}

/**
 * ハンデ分け：ランクの高い順に並べて強いプレイヤーを TEAM A に集める
 * 同ランクの場合はランダムな順序で並べる
 */
function handicapSplit(playerData) {
  const sizeA   = Math.ceil(playerData.length / 2)
  const sorted  = [...playerData].sort((a, b) =>
    b.rankValue !== a.rankValue ? b.rankValue - a.rankValue : Math.random() - 0.5
  )
  const a = sorted.slice(0, sizeA)
  const b = sorted.slice(sizeA)
  return {
    a, b,
    diff: Math.abs(
      a.reduce((s, p) => s + p.rankValue, 0) -
      b.reduce((s, p) => s + p.rankValue, 0)
    ),
  }
}

// ---- ハンデスロット演出 ----
/**
 * HANDICAPS 配列からランダムに切り替えながら最終的に final のハンデを表示する
 * Map.vue や Agent5.vue と同じ「再帰 setTimeout + 累乗減速」パターンを使用
 */
function startHandicapSlot(final) {
  isHandicapRolling.value = true
  handicapLocked.value    = false
  const STEPS = 24

  function step(count) {
    if (count >= STEPS) {
      displayHandicap.value   = final
      isHandicapRolling.value = false
      // 80ms 後に確定フラグを立てて確定フラッシュ演出を開始
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

// ハンデの target に応じた確定ラベルを返すヘルパー
const HANDICAP_CONFIRM_LABELS = {
  strong: '強チームへのハンデ 確定',
  weak:   '弱チームへのボーナス 確定',
  both:   '両チームへのルール 確定',
}
function handicapConfirmLabel(handicap) {
  return HANDICAP_CONFIRM_LABELS[handicap?.target] ?? HANDICAP_CONFIRM_LABELS.strong
}

// チームの平均ランクに最も近いランクラベルを返すヘルパー
function avgRankLabel(team) {
  if (team.length === 0) return '—'
  const avg = team.reduce((s, p) => s + p.rankValue, 0) / team.length
  return TEAM_RANKS.reduce((prev, r) =>
    Math.abs(r.value - avg) < Math.abs(prev.value - avg) ? r : prev
  ).label
}

// ---- カスタムページへ遷移してプレイヤー名を引き継ぎ ----
function goToCustom() {
  if (!result.value) return
  // useSharedTeam を通じて Agent5v5 へプレイヤー名を渡す
  setTeams(
    result.value.a.map(p => p.name),
    result.value.b.map(p => p.name),
  )
  emit('go-custom') // App.vue でタブを 'agent5v5' へ切り替える
}

// ---- チーム分け実行 ----
const SPLIT_ANIMATION_MS  = 2400 // 演出パネルを表示する時間（ms）
const HANDICAP_SLOT_DELAY = 700  // 結果表示後にハンデスロットを開始するまでの遅延（ms）

function splitTeams() {
  if (isRolling.value) return

  // 前回の結果・演出状態をリセット
  isRolling.value         = true
  showResult.value        = false
  result.value            = null
  displayHandicap.value   = null
  isHandicapRolling.value = false
  handicapLocked.value    = false

  // プレイヤーデータに rankValue を付与（計算用）
  const playerData = players.map(p => ({
    name:      p.name.trim() || p.placeholder,
    rank:      p.rank,
    rankValue: RANK_MAP[p.rank].value,
  }))

  // SPLIT_ANIMATION_MS 間、演出パネルを表示してからチーム分けを実行
  setTimeout(() => {
    let split
    if      (mode.value === 'balance')  split = balancedSplit(playerData)
    else if (mode.value === 'handicap') split = handicapSplit(playerData)
    else                                split = flatSplit(playerData)

    // ハンデモードの場合はランダムにハンデを選択
    const finalHandicap = mode.value === 'handicap'
      ? HANDICAPS[Math.floor(Math.random() * HANDICAPS.length)]
      : null

    split.handicap  = finalHandicap
    result.value    = split
    resultKey.value++
    isRolling.value = false

    // DOM 更新後に結果エリアを表示してスクロール
    nextTick(() => {
      showResult.value = true
      scrollTo(resultAreaRef.value)
      // ハンデモードの場合はスクロール後にスロット演出を開始
      if (mode.value === 'handicap') {
        setTimeout(() => startHandicapSlot(finalHandicap), HANDICAP_SLOT_DELAY)
      }
    })
  }, SPLIT_ANIMATION_MS)
}
</script>

<template>
  <div>
    <h1 class="section-title">VALORANTチーム分けツール | バランス・ランダム・ハンデ対応【無料】</h1>
    <p class="section-desc">2〜10人のプレイヤーをランダムにチーム分け。バランスモード（ランク差最小化）・ランダムモード・ハンデモードに対応。フルパや内輪カスタムのチーム決めに最適。</p>

    <!-- コントロールバー（人数・モード・一括入力） -->
    <div class="ts-control-bar">
      <div class="ts-count-group">
        <span class="ts-count-label">プレイヤー数</span>
        <div class="size-control">
          <button class="size-btn" @click="removePlayer" :disabled="isRolling || players.length <= MIN_PLAYERS">−</button>
          <span class="size-display">{{ players.length }}<span class="size-max">/{{ MAX_PLAYERS }}</span></span>
          <button class="size-btn" @click="addPlayer"    :disabled="isRolling || players.length >= MAX_PLAYERS">＋</button>
        </div>
        <!-- 現在の人数から導出されるチームサイズを表示 -->
        <span class="ts-team-info">→ {{ teamSizes.a }}人 vs {{ teamSizes.b }}人</span>
      </div>

      <!-- モード選択ボタン -->
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

    <!-- 一括入力パネル -->
    <Transition name="bulk-panel">
      <div v-if="showBulkInput" class="bulk-panel">
        <div class="bulk-paste-guide">
          <span class="bulk-paste-guide__label">TIP</span>
          <span>改行区切りのテキストをペーストすると自動で一括入力されます</span>
          <span class="bulk-paste-guide__example">例: Player1 ↵ Player2 ↵ Player3</span>
        </div>
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
        </div>
      </div>
    </Transition>

    <!-- プレイヤー入力リスト（名前 + ランク選択） -->
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
          <!-- ランク選択チップ（8段階） -->
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

    <!-- チーム分けボタン（演出中はドットアニメーション） -->
    <button class="btn-primary" :class="{ 'btn-primary--splitting': isRolling }" @click="splitTeams" :disabled="isRolling">
      <span v-if="isRolling" class="ts-splitting-text">
        <span class="ts-splitting-dot">■</span>
        <span class="ts-splitting-dot">■</span>
        <span class="ts-splitting-dot">■</span>
        SPLITTING
      </span>
      <span v-else>⚡ チーム分け開始</span>
    </button>

    <!-- チーム分け演出パネル（isRolling 中のみ表示） -->
    <Transition name="ts-stage">
      <div v-if="isRolling" class="ts-split-stage">
        <div class="ts-split-stage__scanline"></div>
        <div class="ts-split-stage__title">SPLITTING<span class="ts-split-stage__title-sub"> TEAMS</span></div>
        <div class="ts-split-stage__teams">
          <div class="ts-split-stage__team ts-split-stage__team--a">TEAM A</div>
          <div class="ts-split-stage__vs">VS</div>
          <div class="ts-split-stage__team ts-split-stage__team--b">TEAM B</div>
        </div>
        <!-- プレイヤー名をカスケード表示（animationDelay でずらしてリップル効果） -->
        <div class="ts-split-stage__names">
          <span
            v-for="(p, i) in players" :key="i"
            class="ts-split-stage__name"
            :style="{ animationDelay: `${i * 55}ms` }"
          >{{ p.name || p.placeholder }}</span>
        </div>
        <div class="ts-split-stage__progress-wrap">
          <div class="ts-split-stage__progress"></div>
        </div>
      </div>
    </Transition>

    <!-- 結果エリア（showResult が true になると表示） -->
    <div v-if="showResult && result" class="ts-result-area" ref="resultAreaRef" :key="resultKey">
      <div class="result-title">— 結果 —</div>

      <!-- ステータスバー（モード・ランク差） -->
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

        <div class="ts-vs">VS</div>

        <!-- TEAM B（animationDelay を TEAM A の続きから開始して全体が流れるように） -->
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

      <!-- ハンデスロット演出（ハンデモード かつ displayHandicap が設定済みの場合のみ表示） -->
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
              {{ isHandicapRolling ? 'DRAWING HANDICAP...' : handicapConfirmLabel(displayHandicap) }}
            </span>
            <span class="ts-handicap-card__name">{{ displayHandicap.label }}</span>
          </div>
          <!-- 強さインジケーター（1〜5段階） -->
          <div class="ts-handicap-card__strength" :class="{ 'ts-handicap-card__strength--hidden': isHandicapRolling }">
            <span class="ts-handicap-card__strength-text">強さ</span>
            <span class="ts-handicap-card__pips">
              <span
                v-for="n in 5" :key="n"
                class="ts-handicap-card__pip"
                :class="{ 'ts-handicap-card__pip--filled': n <= displayHandicap.strength }"
              />
            </span>
            <span class="ts-handicap-card__strength-num">{{ displayHandicap.strength }}/5</span>
          </div>
          <!-- スロット中はハンデ説明を非表示にしてチラ見えを防止 -->
          <p class="ts-handicap-card__desc" :class="{ 'ts-handicap-card__desc--hidden': isHandicapRolling }">
            {{ displayHandicap.desc }}
          </p>
          <!-- handicapLocked が true になったタイミングでフラッシュ演出 -->
          <div v-if="handicapLocked" class="ts-handicap-card__flash" />
        </div>
      </div>

      <!-- アクションボタン（もう一度 / カスタムへ） -->
      <div class="ts-action-bar">
        <button class="ts-retry-btn"  @click="splitTeams"  :disabled="isRolling || isHandicapRolling">↺ もう一度</button>
        <button class="ts-goto-btn"   @click="goToCustom"  :disabled="isRolling || isHandicapRolling">⚡ カスタムでランダムピック</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue'
import { useSharedTeam } from '@/composables/useSharedTeam'
import { AGENTS } from '@/constants/agents'
import { ROLE_LABELS, ROLES_INIT, ROLE_PRESETS } from '@/constants/roles'
import AgentBanBoard from '@/components/AgentBanBoard.vue'
import './Agent5v5.css'

// プレイヤー数の上限・下限
const MAX_SIZE = 5
const MIN_SIZE = 1

// プレイヤーオブジェクトのファクトリ関数
const makePlayer = (n) => ({
  name:        '',
  placeholder: `Player ${n}`,
  roles:       ROLES_INIT.map(r => ({ ...r })), // ディープコピーで各プレイヤーが独立した状態を持つ
})

// ---- チーム状態 ----
const teamAName = ref('TEAM A')
const teamBName = ref('TEAM B')
const teamA = reactive(Array.from({ length: MAX_SIZE }, (_, i) => makePlayer(i + 1)))
const teamB = reactive(Array.from({ length: MAX_SIZE }, (_, i) => makePlayer(i + 1)))

// BANボードの参照（getPool でBANリストを参照するために使用）
const banBoardRefA = ref(null)
const banBoardRefB = ref(null)

// 各チームのプリセット選択状態
const activePresetA = ref(null)
const activePresetB = ref(null)

// ---- 一括入力 ----
// TEAM A / TEAM B それぞれに独立した一括入力パネルを持つ
const showBulkInputA = ref(false)
const showBulkInputB = ref(false)
const bulkNamesA     = ref(Array.from({ length: MAX_SIZE }, () => ''))
const bulkNamesB     = ref(Array.from({ length: MAX_SIZE }, () => ''))

function toggleBulkInputA() {
  showBulkInputA.value = !showBulkInputA.value
  if (showBulkInputA.value) bulkNamesA.value = Array.from({ length: MAX_SIZE }, () => '')
}
function toggleBulkInputB() {
  showBulkInputB.value = !showBulkInputB.value
  if (showBulkInputB.value) bulkNamesB.value = Array.from({ length: MAX_SIZE }, () => '')
}

// 入力された名前配列をチームに反映する共通処理
function applyBulkForTeam(team, bulkNames, showBulkInput) {
  const names = bulkNames.value.map(n => n.trim()).filter(n => n)
  if (!names.length) return
  const newSize = Math.min(Math.max(names.length, MIN_SIZE), MAX_SIZE)
  while (team.length < newSize) team.push(makePlayer(team.length + 1))
  while (team.length > newSize) team.pop()
  names.forEach((name, i) => { if (i < team.length) team[i].name = name })
  bulkNames.value     = Array.from({ length: MAX_SIZE }, () => '')
  showBulkInput.value = false
}

function applyBulkA() { applyBulkForTeam(teamA, bulkNamesA, showBulkInputA) }
function applyBulkB() { applyBulkForTeam(teamB, bulkNamesB, showBulkInputB) }

// 複数行テキストの貼り付けを検知して自動適用
function onBulkPasteA(e, startIdx) {
  const text  = e.clipboardData?.getData('text') ?? ''
  const lines = text.split('\n').map(l => l.replace(/^\d+人目[：:]\s*/, '').trim())
  if (lines.length <= 1) return
  e.preventDefault()
  lines.forEach((name, i) => {
    const idx = startIdx + i
    if (idx < MAX_SIZE) bulkNamesA.value[idx] = name
  })
  nextTick(applyBulkA)
}
function onBulkPasteB(e, startIdx) {
  const text  = e.clipboardData?.getData('text') ?? ''
  const lines = text.split('\n').map(l => l.replace(/^\d+人目[：:]\s*/, '').trim())
  if (lines.length <= 1) return
  e.preventDefault()
  lines.forEach((name, i) => {
    const idx = startIdx + i
    if (idx < MAX_SIZE) bulkNamesB.value[idx] = name
  })
  nextTick(applyBulkB)
}

// ---- ルーレット状態 ----
const results     = ref(null)   // 確定結果 { a: [...], b: [...] }
const rollingRows = ref(null)   // ルーレット中の表示データ { a: [...], b: [...] }
const isRolling   = ref(false)
const error       = ref('')

// ---- トースト通知 ----
const toastMsg = ref('')
let toastTimer = null

function showToast(msg) {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  // 3秒後に自動消去
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 3000)
}

// ---- TeamSplit からのプレイヤー名引き継ぎ ----
const { pendingTeams, consumeTeams } = useSharedTeam()

/**
 * pendingTeams を監視して、値がセットされたら自動的にチームへ反映する
 * immediate: true で初期マウント時にも実行（ページ切り替え前にセットされた場合を考慮）
 */
watch(pendingTeams, (val) => {
  if (!val) return
  const { a, b } = consumeTeams() // データを取得して pendingTeams をクリア

  // 受け取り前の状態をリセット
  results.value     = null
  rollingRows.value = null
  isRolling.value   = false
  error.value       = ''

  // TEAM A にプレイヤー名を反映（チームサイズも調整）
  while (teamA.length > Math.max(a.length, 1)) teamA.pop()
  while (teamA.length < a.length)              teamA.push(makePlayer(teamA.length + 1))
  a.forEach((name, i) => { teamA[i].name = name })

  // TEAM B にプレイヤー名を反映
  while (teamB.length > Math.max(b.length, 1)) teamB.pop()
  while (teamB.length < b.length)              teamB.push(makePlayer(teamB.length + 1))
  b.forEach((name, i) => { teamB[i].name = name })

  window.scrollTo({ top: 0, behavior: 'smooth' })
  nextTick(() => showToast('ユーザー名を設定しました。'))
}, { immediate: true })

// DOM 参照（スクロール・フォーカス制御）
const rollBtnRef     = ref(null)
const rollingAreaRef = ref(null)
const resultAreaRef  = ref(null)
const playerListRefA = ref(null)
const playerListRefB = ref(null)

// Enter キーで次の入力フィールドへフォーカスを移動
function focusNextInput(listRef, idx) {
  const inputs = listRef.value?.querySelectorAll('input[type="text"]')
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
function addTeamPlayer(team) {
  if (isRolling.value || team.length >= MAX_SIZE) return
  team.push(makePlayer(team.length + 1))
}

function removeTeamPlayer(team) {
  if (isRolling.value || team.length <= MIN_SIZE) return
  team.pop()
}

// ---- ドラッグアンドドロップ ----
const dragSrc  = ref(null) // { team: 'a'|'b', idx: number }
const dragOver = ref(null) // { team: 'a'|'b', idx: number }

function onDragStart(team, idx, e) {
  dragSrc.value = { team, idx }
  e.dataTransfer.effectAllowed = 'move'
}

function onDragEnter(team, idx, e) {
  e.preventDefault()
  dragOver.value = { team, idx }
}

function onDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

function onDrop(toTeam, toIdx, e) {
  e.preventDefault()
  if (!dragSrc.value) return
  const { team: fromTeam, idx: fromIdx } = dragSrc.value
  if (fromTeam === toTeam && fromIdx === toIdx) { dragSrc.value = dragOver.value = null; return }

  const srcArr = fromTeam === 'a' ? teamA : teamB
  const dstArr = toTeam   === 'a' ? teamA : teamB

  // name と roles をスワップ（placeholder は番号のまま維持）
  const tmpName  = srcArr[fromIdx].name
  const tmpRoles = srcArr[fromIdx].roles.map(r => ({ ...r }))
  srcArr[fromIdx].name  = dstArr[toIdx].name
  srcArr[fromIdx].roles = dstArr[toIdx].roles.map(r => ({ ...r }))
  dstArr[toIdx].name    = tmpName
  dstArr[toIdx].roles   = tmpRoles

  dragSrc.value = dragOver.value = null
}

function onDragEnd() {
  dragSrc.value = dragOver.value = null
}

// ---- ロール操作 ----
function toggleRole(player, roleKey, teamKey) {
  const r = player.roles.find(r => r.key === roleKey)
  if (r) r.active = !r.active
  // どちらのチームのチップか判定してプリセット選択状態をリセット
  if (teamKey === 'a') activePresetA.value = null
  else                 activePresetB.value = null
}

function applyPreset(team, preset, teamKey) {
  team.forEach((player, i) => {
    const assigned = preset.roles[i]
    player.roles.forEach(r => {
      r.active = assigned === null ? false : r.key === assigned
    })
  })
  if (teamKey === 'a') activePresetA.value = preset.key
  else                 activePresetB.value = preset.key
}

// ---- エージェントプール取得 ----
/**
 * 指定プレイヤーが選べるエージェント候補を返す
 * banned: そのチームのBANセット（チームごとに独立）
 * usedNames: 同チーム内で既に割り当てられたエージェント名（重複防止）
 */
function getPool(player, banned, usedNames = []) {
  const activeKeys = player.roles.filter(r => r.active).map(r => r.key)

  let pool = AGENTS.filter(a => activeKeys.includes(a.role) && !banned.has(a.name))
  if (pool.length === 0) pool = AGENTS.filter(a => !banned.has(a.name))
  if (pool.length === 0) pool = [...AGENTS]

  pool = pool.filter(a => !usedNames.includes(a.name)) // 重複排除
  if (pool.length === 0) pool = AGENTS.filter(a => activeKeys.includes(a.role))
  if (pool.length === 0) pool = [...AGENTS]

  return pool
}

// ---- ルーレット演出定数 ----
const LOCK_BASE     = 1000 // 最初のプレイヤーがロックされるまで（ms）
const LOCK_INTERVAL = 1000 // プレイヤーごとのロック間隔（ms）
const SLOWDOWN_SPAN = 900  // ロック前にスローダウンを開始するタイミング（ms 前から）
const LOCK_DELAY    = 350  // 全員ロック後、結果表示に切り替えるまでの待機時間（ms）

// ---- ランダム割り振り & ルーレット開始 ----
function rollAgents() {
  if (isRolling.value) return
  error.value = ''

  const bannedA = banBoardRefA.value?.banned ?? new Set()
  const bannedB = banBoardRefB.value?.banned ?? new Set()

  // チームごとにエージェントをランダム割り振りする共通処理
  const calcTeam = (team, banned) => {
    const usedNames = []
    return team.map(p => {
      const pool  = getPool(p, banned, usedNames)
      const agent = pool[Math.floor(Math.random() * pool.length)]
      usedNames.push(agent.name)
      return { player: p.name.trim() || p.placeholder, agent }
    })
  }

  const finalA = calcTeam(teamA, bannedA)
  const finalB = calcTeam(teamB, bannedB)

  results.value     = null
  isRolling.value   = true
  // ルーレット初期表示データ（両チーム分）
  rollingRows.value = {
    a: finalA.map((r, i) => ({ player: r.player, displayAgent: AGENTS[Math.floor(Math.random() * AGENTS.length)], locked: false, index: i })),
    b: finalB.map((r, i) => ({ player: r.player, displayAgent: AGENTS[Math.floor(Math.random() * AGENTS.length)], locked: false, index: i })),
  }
  nextTick(() => scrollTo(rollBtnRef.value))

  let lockedCount    = 0
  const totalPlayers = teamA.length + teamB.length

  // TEAM A と TEAM B のエントリを1つの配列にまとめてループ処理
  ;[...finalA.map((f, i) => ({ team: 'a', idx: i, final: f })),
    ...finalB.map((f, i) => ({ team: 'b', idx: i, final: f }))
  ].forEach(({ team, idx, final }) => {
    const lockAt     = LOCK_BASE + idx * LOCK_INTERVAL
    const slowdownAt = lockAt - SLOWDOWN_SPAN

    /**
     * 再帰的な setTimeout でルーレット表現
     * プレイヤーのインデックスに基づいて A・B の両チームが同時進行する
     */
    function tick(elapsed) {
      if (elapsed >= lockAt) {
        rollingRows.value[team][idx].displayAgent = final.agent
        rollingRows.value[team][idx].locked = true
        lockedCount++
        // 全プレイヤーがロックされたら結果表示へ
        if (lockedCount === totalPlayers) {
          setTimeout(() => {
            results.value     = { a: finalA, b: finalB }
            rollingRows.value = null
            isRolling.value   = false
            nextTick(() => scrollTo(resultAreaRef.value))
          }, LOCK_DELAY)
        }
        return
      }
      rollingRows.value[team][idx].displayAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
      const delay = elapsed < slowdownAt
        ? 50
        : 50 + Math.pow((elapsed - slowdownAt) / SLOWDOWN_SPAN, 1.8) * 450
      setTimeout(() => tick(elapsed + delay), delay)
    }
    tick(0)
  })
}
</script>

<template>
  <div>
    <h1 class="section-title">5v5 VALORANTキャラ ランダムピック</h1>
    <p class="section-desc">カスタムゲーム用 — TEAM A・TEAM Bそれぞれ1〜5人のキャラをランダム割り振り。チーム別バン・ロール設定対応。</p>

    <!-- Team Split からの引き継ぎ通知トースト -->
    <Transition name="toast">
      <div v-if="toastMsg" class="a5v5-toast">{{ toastMsg }}</div>
    </Transition>

    <!-- 2カラムのチーム入力エリア -->
    <div class="team-grid">

      <!-- TEAM A -->
      <div class="team-card team-card--a">
        <div class="team-card__header">
          <span class="team-card__dot team-card__dot--a"></span>
          <input class="team-card__name-input" v-model="teamAName" maxlength="12" :disabled="isRolling" />
          <div class="team-card__actions">
            <div class="size-control">
              <button class="size-btn" @click="removeTeamPlayer(teamA)" :disabled="isRolling || teamA.length <= 1">−</button>
              <span class="size-display">{{ teamA.length }}<span class="size-max">/5</span></span>
              <button class="size-btn" @click="addTeamPlayer(teamA)"    :disabled="isRolling || teamA.length >= 5">＋</button>
            </div>
            <div class="preset-bar">
              <button
                v-for="p in ROLE_PRESETS" :key="p.key"
                class="preset-btn"
                :class="{ 'preset-btn--clr': p.key === 'clr', 'preset-btn--active': activePresetA === p.key }"
                :title="p.desc"
                :disabled="isRolling"
                @click="applyPreset(teamA, p, 'a')"
              >{{ p.label }}</button>
            </div>
            <button
              class="bulk-toggle-btn"
              :class="{ 'bulk-toggle-btn--active': showBulkInputA }"
              :disabled="isRolling"
              @click="toggleBulkInputA"
            >📋 一括入力</button>
          </div>
        </div>
        <Transition name="bulk-panel">
          <div v-if="showBulkInputA" class="bulk-panel">
            <div class="bulk-paste-guide">
              <span class="bulk-paste-guide__label">TIP</span>
              <span>改行区切りのテキストをペーストすると自動で一括入力されます</span>
              <span class="bulk-paste-guide__example">例: Player1 ↵ Player2 ↵ Player3</span>
            </div>
            <div class="bulk-rows">
              <div v-for="n in MAX_SIZE" :key="n" class="bulk-row">
                <span class="bulk-label">{{ n }}人目：</span>
                <input
                  class="bulk-input"
                  type="text"
                  v-model="bulkNamesA[n - 1]"
                  :placeholder="`Player ${n}`"
                  maxlength="20"
                  :disabled="isRolling"
                  @paste="e => onBulkPasteA(e, n - 1)"
                />
              </div>
            </div>
            <div class="bulk-actions">
              <button class="bulk-apply-btn" @click="applyBulkA" :disabled="isRolling">適用</button>
              <button class="bulk-close-btn" @click="toggleBulkInputA">閉じる</button>
            </div>
          </div>
        </Transition>
        <AgentBanBoard ref="banBoardRefA" :disabled="isRolling" />
        <div class="player-list" ref="playerListRefA">
          <div
            v-for="(player, idx) in teamA" :key="idx"
            class="player-block"
            :class="{
              'player-block--dragging': dragSrc?.team === 'a' && dragSrc?.idx === idx,
              'player-block--dragover': dragOver?.team === 'a' && dragOver?.idx === idx,
            }"
            :draggable="!isRolling"
            @dragstart="e => onDragStart('a', idx, e)"
            @dragenter="e => onDragEnter('a', idx, e)"
            @dragover="onDragOver"
            @drop="e => onDrop('a', idx, e)"
            @dragend="onDragEnd"
          >
            <span class="player-drag-handle" :class="{ 'player-drag-handle--disabled': isRolling }">⠿</span>
            <span class="player-num">{{ String(idx + 1).padStart(2, '0') }}</span>
            <div class="player-block__inner">
              <input
                class="player-row__input"
                type="text"
                :placeholder="player.placeholder"
                maxlength="20"
                v-model="player.name"
                :disabled="isRolling"
                @keydown.enter="focusNextInput(playerListRefA, idx)"
              />
              <div class="player-role-row">
                <div
                  v-for="role in player.roles" :key="role.key"
                  class="player-role-chip"
                  :class="[`player-role-chip--${role.key}`, { 'player-role-chip--active': role.active }]"
                  @click="!isRolling && toggleRole(player, role.key, 'a')"
                >{{ role.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VS 区切り -->
      <div class="vs-divider"><span>VS</span></div>

      <!-- TEAM B（TEAM A と対称的な構成） -->
      <div class="team-card team-card--b">
        <div class="team-card__header">
          <span class="team-card__dot team-card__dot--b"></span>
          <input class="team-card__name-input" v-model="teamBName" maxlength="12" :disabled="isRolling" />
          <div class="team-card__actions">
            <div class="size-control">
              <button class="size-btn" @click="removeTeamPlayer(teamB)" :disabled="isRolling || teamB.length <= 1">−</button>
              <span class="size-display">{{ teamB.length }}<span class="size-max">/5</span></span>
              <button class="size-btn" @click="addTeamPlayer(teamB)"    :disabled="isRolling || teamB.length >= 5">＋</button>
            </div>
            <div class="preset-bar">
              <button
                v-for="p in ROLE_PRESETS" :key="p.key"
                class="preset-btn"
                :class="{ 'preset-btn--clr': p.key === 'clr', 'preset-btn--active': activePresetB === p.key }"
                :title="p.desc"
                :disabled="isRolling"
                @click="applyPreset(teamB, p, 'b')"
              >{{ p.label }}</button>
            </div>
            <button
              class="bulk-toggle-btn"
              :class="{ 'bulk-toggle-btn--active': showBulkInputB }"
              :disabled="isRolling"
              @click="toggleBulkInputB"
            >📋 一括入力</button>
          </div>
        </div>
        <Transition name="bulk-panel">
          <div v-if="showBulkInputB" class="bulk-panel">
            <div class="bulk-paste-guide">
              <span class="bulk-paste-guide__label">TIP</span>
              <span>改行区切りのテキストをペーストすると自動で一括入力されます</span>
              <span class="bulk-paste-guide__example">例: Player1 ↵ Player2 ↵ Player3</span>
            </div>
            <div class="bulk-rows">
              <div v-for="n in MAX_SIZE" :key="n" class="bulk-row">
                <span class="bulk-label">{{ n }}人目：</span>
                <input
                  class="bulk-input"
                  type="text"
                  v-model="bulkNamesB[n - 1]"
                  :placeholder="`Player ${n}`"
                  maxlength="20"
                  :disabled="isRolling"
                  @paste="e => onBulkPasteB(e, n - 1)"
                />
              </div>
            </div>
            <div class="bulk-actions">
              <button class="bulk-apply-btn" @click="applyBulkB" :disabled="isRolling">適用</button>
              <button class="bulk-close-btn" @click="toggleBulkInputB">閉じる</button>
            </div>
          </div>
        </Transition>
        <AgentBanBoard ref="banBoardRefB" :disabled="isRolling" />
        <div class="player-list" ref="playerListRefB">
          <div
            v-for="(player, idx) in teamB" :key="idx"
            class="player-block"
            :class="{
              'player-block--dragging': dragSrc?.team === 'b' && dragSrc?.idx === idx,
              'player-block--dragover': dragOver?.team === 'b' && dragOver?.idx === idx,
            }"
            :draggable="!isRolling"
            @dragstart="e => onDragStart('b', idx, e)"
            @dragenter="e => onDragEnter('b', idx, e)"
            @dragover="onDragOver"
            @drop="e => onDrop('b', idx, e)"
            @dragend="onDragEnd"
          >
            <span class="player-drag-handle" :class="{ 'player-drag-handle--disabled': isRolling }">⠿</span>
            <span class="player-num">{{ String(idx + 1).padStart(2, '0') }}</span>
            <div class="player-block__inner">
              <input
                class="player-row__input"
                type="text"
                :placeholder="player.placeholder"
                maxlength="20"
                v-model="player.name"
                :disabled="isRolling"
                @keydown.enter="focusNextInput(playerListRefB, idx)"
              />
              <div class="player-role-row">
                <div
                  v-for="role in player.roles" :key="role.key"
                  class="player-role-chip"
                  :class="[`player-role-chip--${role.key}`, { 'player-role-chip--active': role.active }]"
                  @click="!isRolling && toggleRole(player, role.key, 'b')"
                >{{ role.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="error" class="notice">{{ error }}</div>

    <!-- 抽選ボタン -->
    <button class="btn-primary" ref="rollBtnRef" @click="rollAgents" :disabled="isRolling">
      {{ isRolling ? '⚡ ROLLING...' : '⚡ 抽選開始' }}
    </button>

    <!-- ルーレット演出エリア -->
    <div v-if="rollingRows" class="result-area" ref="rollingAreaRef">
      <div class="rolling-label">
        <span class="rolling-label__dot"></span>
        AGENT DRAFT IN PROGRESS
        <span class="rolling-label__dot"></span>
      </div>
      <div class="match-grid">
        <!-- TEAM A ルーレット -->
        <div class="match-team">
          <div class="match-team__label match-team__label--a">{{ teamAName }}</div>
          <div class="rolling-col">
            <div
              v-for="row in rollingRows.a" :key="row.index"
              class="rolling-card"
              :class="{ 'rolling-card--locked': row.locked }"
            >
              <img class="rolling-card__portrait" :src="row.displayAgent.portrait" :alt="row.displayAgent.name" />
              <div class="rolling-card__overlay" :class="`rolling-card__overlay--${row.displayAgent.role}`" />
              <div class="rolling-card__info">
                <div class="rolling-card__player">{{ row.player }}</div>
                <div class="rolling-card__name">{{ row.displayAgent.name }}</div>
                <div class="rolling-card__role-badge" :class="`agent-role--${row.displayAgent.role}`">{{ ROLE_LABELS[row.displayAgent.role] }}</div>
              </div>
              <div v-if="row.locked" class="rolling-card__lock">✓</div>
            </div>
          </div>
        </div>

        <div class="match-vs">VS</div>

        <!-- TEAM B ルーレット -->
        <div class="match-team">
          <div class="match-team__label match-team__label--b">{{ teamBName }}</div>
          <div class="rolling-col">
            <div
              v-for="row in rollingRows.b" :key="row.index"
              class="rolling-card"
              :class="{ 'rolling-card--locked': row.locked }"
            >
              <img class="rolling-card__portrait" :src="row.displayAgent.portrait" :alt="row.displayAgent.name" />
              <div class="rolling-card__overlay" :class="`rolling-card__overlay--${row.displayAgent.role}`" />
              <div class="rolling-card__info">
                <div class="rolling-card__player">{{ row.player }}</div>
                <div class="rolling-card__name">{{ row.displayAgent.name }}</div>
                <div class="rolling-card__role-badge" :class="`agent-role--${row.displayAgent.role}`">{{ ROLE_LABELS[row.displayAgent.role] }}</div>
              </div>
              <div v-if="row.locked" class="rolling-card__lock">✓</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 確定結果エリア -->
    <div v-if="results && !isRolling" class="result-area" ref="resultAreaRef">
      <div class="result-title">— 結果 —</div>
      <div class="match-grid">
        <!-- TEAM A 結果 -->
        <div class="match-team">
          <div class="match-team__label match-team__label--a">{{ teamAName }}</div>
          <div class="result-col">
            <div
              v-for="(r, i) in results.a" :key="i"
              class="result-card"
              :class="`result-card--${r.agent.role}`"
              :style="{ animationDelay: `${i * 80}ms` }"
            >
              <img class="result-card__portrait" :src="r.agent.portrait" :alt="r.agent.name" />
              <div class="result-card__overlay" :class="`result-card__overlay--${r.agent.role}`" />
              <div class="result-card__info">
                <div class="result-card__player">{{ r.player }}</div>
                <div class="result-card__name">{{ r.agent.name }}</div>
                <div class="result-card__role" :class="`agent-role--${r.agent.role}`">{{ ROLE_LABELS[r.agent.role] }}</div>
              </div>
              <img class="result-card__icon" :src="r.agent.icon" :alt="r.agent.name" />
            </div>
          </div>
        </div>

        <div class="match-vs">VS</div>

        <!-- TEAM B 結果 -->
        <div class="match-team">
          <div class="match-team__label match-team__label--b">{{ teamBName }}</div>
          <div class="result-col">
            <div
              v-for="(r, i) in results.b" :key="i"
              class="result-card"
              :class="`result-card--${r.agent.role}`"
              :style="{ animationDelay: `${i * 80}ms` }"
            >
              <img class="result-card__portrait" :src="r.agent.portrait" :alt="r.agent.name" />
              <div class="result-card__overlay" :class="`result-card__overlay--${r.agent.role}`" />
              <div class="result-card__info">
                <div class="result-card__player">{{ r.player }}</div>
                <div class="result-card__name">{{ r.agent.name }}</div>
                <div class="result-card__role" :class="`agent-role--${r.agent.role}`">{{ ROLE_LABELS[r.agent.role] }}</div>
              </div>
              <img class="result-card__icon" :src="r.agent.icon" :alt="r.agent.name" />
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

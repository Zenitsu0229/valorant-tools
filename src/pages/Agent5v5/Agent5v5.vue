<script setup>
import { ref, reactive, nextTick, watch } from 'vue'
import { useSharedTeam } from '@/composables/useSharedTeam'
import { AGENTS } from '@/constants/agents'
import { ROLE_LABELS, ROLES_INIT, ROLE_PRESETS } from '@/constants/roles'
import AgentBanBoard from '@/components/AgentBanBoard.vue'
import './Agent5v5.css'

const MAX_SIZE = 5
const MIN_SIZE = 1

const makePlayer = (n) => ({
  name: '',
  placeholder: `Player ${n}`,
  roles: ROLES_INIT.map(r => ({ ...r })),
})

// --- State ---
const teamAName = ref('TEAM A')
const teamBName = ref('TEAM B')
const teamA = reactive(Array.from({ length: MAX_SIZE }, (_, i) => makePlayer(i + 1)))
const teamB = reactive(Array.from({ length: MAX_SIZE }, (_, i) => makePlayer(i + 1)))

const banBoardRefA = ref(null)
const banBoardRefB = ref(null)

const activePresetA = ref(null)
const activePresetB = ref(null)

const showBulkInputA = ref(false)
const showBulkInputB = ref(false)
const bulkTextA      = ref('')
const bulkTextB      = ref('')

function makeBulkTemplate(size) {
  return Array.from({ length: size }, (_, i) => `${i + 1}人目：`).join('\n')
}
function toggleBulkInputA() {
  showBulkInputA.value = !showBulkInputA.value
  bulkTextA.value = showBulkInputA.value ? makeBulkTemplate(MAX_SIZE) : ''
}
function toggleBulkInputB() {
  showBulkInputB.value = !showBulkInputB.value
  bulkTextB.value = showBulkInputB.value ? makeBulkTemplate(MAX_SIZE) : ''
}

function applyBulkForTeam(team, bulkText, showBulkInput) {
  const lines = bulkText.value.split('\n')
    .map(l => l.replace(/^\d+人目[：:]\s*/, '').trim())
    .filter(l => l)
  if (!lines.length) return
  const newSize = Math.min(Math.max(lines.length, MIN_SIZE), MAX_SIZE)
  while (team.length < newSize) team.push(makePlayer(team.length + 1))
  while (team.length > newSize) team.pop()
  lines.forEach((name, i) => { if (i < team.length) team[i].name = name })
  bulkText.value = ''
  showBulkInput.value = false
}
function applyBulkA() { applyBulkForTeam(teamA, bulkTextA, showBulkInputA) }
function applyBulkB() { applyBulkForTeam(teamB, bulkTextB, showBulkInputB) }
function onBulkPasteA() { nextTick(applyBulkA) }
function onBulkPasteB() { nextTick(applyBulkB) }

const results     = ref(null)
const rollingRows = ref(null)
const isRolling   = ref(false)
const error       = ref('')
const toastMsg    = ref('')
let toastTimer    = null

function showToast(msg) {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 3000)
}

// --- Team Split からのプレイヤー名引き継ぎ ---
const { pendingTeams, consumeTeams } = useSharedTeam()
watch(pendingTeams, (val) => {
  if (!val) return
  const { a, b } = consumeTeams()

  results.value     = null
  rollingRows.value = null
  isRolling.value   = false
  error.value       = ''

  while (teamA.length > Math.max(a.length, 1)) teamA.pop()
  while (teamA.length < a.length) teamA.push(makePlayer(teamA.length + 1))
  a.forEach((name, i) => { teamA[i].name = name })

  while (teamB.length > Math.max(b.length, 1)) teamB.pop()
  while (teamB.length < b.length) teamB.push(makePlayer(teamB.length + 1))
  b.forEach((name, i) => { teamB[i].name = name })

  window.scrollTo({ top: 0, behavior: 'smooth' })
  nextTick(() => showToast('ユーザー名を設定しました。'))
}, { immediate: true })

const rollBtnRef      = ref(null)
const rollingAreaRef  = ref(null)
const resultAreaRef   = ref(null)
const playerListRefA  = ref(null)
const playerListRefB  = ref(null)

function focusNextInput(listRef, idx) {
  const inputs = listRef.value?.querySelectorAll('input[type="text"]')
  if (inputs?.[idx + 1]) inputs[idx + 1].focus()
}

function scrollTo(el) {
  if (!el) return
  const headerH = document.querySelector('.sticky-top')?.offsetHeight ?? 0
  const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12
  window.scrollTo({ top, behavior: 'smooth' })
}

// --- プレイヤー追加・削除 ---
function addTeamPlayer(team) {
  if (isRolling.value || team.length >= MAX_SIZE) return
  team.push(makePlayer(team.length + 1))
}

function removeTeamPlayer(team) {
  if (isRolling.value || team.length <= MIN_SIZE) return
  team.pop()
}

// --- ロール操作 ---
function toggleRole(player, roleKey, teamKey) {
  const r = player.roles.find(r => r.key === roleKey)
  if (r) r.active = !r.active
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

// --- プレイヤーのプール取得 ---
function getPool(player, banned, usedNames = []) {
  const activeKeys = player.roles.filter(r => r.active).map(r => r.key)
  let pool = AGENTS.filter(a => activeKeys.includes(a.role) && !banned.has(a.name))
  if (pool.length === 0) pool = AGENTS.filter(a => !banned.has(a.name))
  if (pool.length === 0) pool = [...AGENTS]
  pool = pool.filter(a => !usedNames.includes(a.name))
  if (pool.length === 0) pool = AGENTS.filter(a => activeKeys.includes(a.role))
  if (pool.length === 0) pool = [...AGENTS]
  return pool
}

// --- ランダム割り振り ---
function rollAgents() {
  if (isRolling.value) return
  error.value = ''

  const bannedA = banBoardRefA.value?.banned ?? new Set()
  const bannedB = banBoardRefB.value?.banned ?? new Set()

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
  rollingRows.value = {
    a: finalA.map((r, i) => ({ player: r.player, displayAgent: AGENTS[Math.floor(Math.random() * AGENTS.length)], locked: false, index: i })),
    b: finalB.map((r, i) => ({ player: r.player, displayAgent: AGENTS[Math.floor(Math.random() * AGENTS.length)], locked: false, index: i })),
  }
  nextTick(() => scrollTo(rollBtnRef.value))

  const LOCK_BASE     = 1000
  const LOCK_INTERVAL = 1000
  const SLOWDOWN_SPAN = 900
  let lockedCount = 0
  const totalPlayers = teamA.length + teamB.length

  ;[...finalA.map((f, i) => ({ team: 'a', idx: i, final: f })),
    ...finalB.map((f, i) => ({ team: 'b', idx: i, final: f }))
  ].forEach(({ team, idx, final }) => {
    const lockAt     = LOCK_BASE + idx * LOCK_INTERVAL
    const slowdownAt = lockAt - SLOWDOWN_SPAN

    function tick(elapsed) {
      if (elapsed >= lockAt) {
        rollingRows.value[team][idx].displayAgent = final.agent
        rollingRows.value[team][idx].locked = true
        lockedCount++
        if (lockedCount === totalPlayers) {
          setTimeout(() => {
            results.value     = { a: finalA, b: finalB }
            rollingRows.value = null
            isRolling.value   = false
            nextTick(() => scrollTo(resultAreaRef.value))
          }, 350)
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

    <!-- インラインメッセージ -->
    <Transition name="toast">
      <div v-if="toastMsg" class="a5v5-toast">{{ toastMsg }}</div>
    </Transition>

    <!-- チーム入力 -->
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
              <button class="size-btn" @click="addTeamPlayer(teamA)" :disabled="isRolling || teamA.length >= 5">＋</button>
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
            <textarea
              class="bulk-textarea"
              v-model="bulkTextA"
              :rows="MAX_SIZE"
              @paste="onBulkPasteA"
              :disabled="isRolling"
            ></textarea>
            <div class="bulk-actions">
              <button class="bulk-apply-btn" @click="applyBulkA" :disabled="isRolling">適用</button>
              <button class="bulk-close-btn" @click="toggleBulkInputA">閉じる</button>
              <span class="bulk-hint">貼り付けで自動適用</span>
            </div>
          </div>
        </Transition>
        <AgentBanBoard ref="banBoardRefA" :disabled="isRolling" />
        <div class="player-list" ref="playerListRefA">
          <div v-for="(player, idx) in teamA" :key="idx" class="player-block">
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

      <!-- VS -->
      <div class="vs-divider"><span>VS</span></div>

      <!-- TEAM B -->
      <div class="team-card team-card--b">
        <div class="team-card__header">
          <span class="team-card__dot team-card__dot--b"></span>
          <input class="team-card__name-input" v-model="teamBName" maxlength="12" :disabled="isRolling" />
          <div class="team-card__actions">
            <div class="size-control">
              <button class="size-btn" @click="removeTeamPlayer(teamB)" :disabled="isRolling || teamB.length <= 1">−</button>
              <span class="size-display">{{ teamB.length }}<span class="size-max">/5</span></span>
              <button class="size-btn" @click="addTeamPlayer(teamB)" :disabled="isRolling || teamB.length >= 5">＋</button>
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
            <textarea
              class="bulk-textarea"
              v-model="bulkTextB"
              :rows="MAX_SIZE"
              @paste="onBulkPasteB"
              :disabled="isRolling"
            ></textarea>
            <div class="bulk-actions">
              <button class="bulk-apply-btn" @click="applyBulkB" :disabled="isRolling">適用</button>
              <button class="bulk-close-btn" @click="toggleBulkInputB">閉じる</button>
              <span class="bulk-hint">貼り付けで自動適用</span>
            </div>
          </div>
        </Transition>
        <AgentBanBoard ref="banBoardRefB" :disabled="isRolling" />
        <div class="player-list" ref="playerListRefB">
          <div v-for="(player, idx) in teamB" :key="idx" class="player-block">
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

    <button class="btn-primary" ref="rollBtnRef" @click="rollAgents" :disabled="isRolling">
      {{ isRolling ? '⚡ ROLLING...' : '⚡ 抽選開始' }}
    </button>

    <!-- ルーレット中 -->
    <div v-if="rollingRows" class="result-area" ref="rollingAreaRef">
      <div class="rolling-label">
        <span class="rolling-label__dot"></span>
        AGENT DRAFT IN PROGRESS
        <span class="rolling-label__dot"></span>
      </div>
      <div class="match-grid">
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

    <!-- 確定結果 -->
    <div v-if="results && !isRolling" class="result-area" ref="resultAreaRef">
      <div class="result-title">— 結果 —</div>
      <div class="match-grid">
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

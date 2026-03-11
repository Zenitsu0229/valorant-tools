<script setup>
import { ref, reactive, nextTick } from 'vue'
import { AGENTS } from '../../constants/agents'
import { ROLE_LABELS, ROLES_INIT, ROLE_PRESETS } from '../../constants/roles'
import AgentBanBoard from '../../components/AgentBanBoard.vue'
import './Agent5.css'

const TEAM_SIZE = 5

const makePlayer = (n) => ({
  name: '',
  placeholder: `Player ${n}`,
  roles: ROLES_INIT.map(r => ({ ...r })),
})

// --- State ---
const team        = reactive(Array.from({ length: TEAM_SIZE }, (_, i) => makePlayer(i + 1)))
const results     = ref(null)
const rollingRows = ref(null)
const isRolling   = ref(false)

const banBoardRef    = ref(null)
const rollingAreaRef = ref(null)
const resultAreaRef  = ref(null)

function scrollTo(el) {
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// --- ロール操作 ---
function toggleRole(player, roleKey) {
  const r = player.roles.find(r => r.key === roleKey)
  if (r) r.active = !r.active
}

function applyPreset(preset) {
  team.forEach((player, i) => {
    const assigned = preset.roles[i]
    player.roles.forEach(r => {
      r.active = assigned === null ? false : r.key === assigned
    })
  })
}

// --- プレイヤーのプール取得 ---
function getPool(player, usedNames = []) {
  const banned     = banBoardRef.value?.banned ?? new Set()
  const activeKeys = player.roles.filter(r => r.active).map(r => r.key)
  let pool = AGENTS.filter(a => activeKeys.includes(a.role) && !banned.has(a.name))
  if (pool.length === 0) pool = AGENTS.filter(a => !banned.has(a.name))
  if (pool.length === 0) pool = [...AGENTS]
  pool = pool.filter(a => !usedNames.includes(a.name))
  if (pool.length === 0) pool = AGENTS.filter(a => !banned.has(a.name))
  if (pool.length === 0) pool = [...AGENTS]
  return pool
}

// --- ランダム割り振り ---
function rollAgents() {
  if (isRolling.value) return

  const usedNames = []
  const finalTeam = team.map(p => {
    const pool  = getPool(p, usedNames)
    const agent = pool[Math.floor(Math.random() * pool.length)]
    usedNames.push(agent.name)
    return { player: p.name.trim() || p.placeholder, agent }
  })

  isRolling.value   = true
  results.value     = null
  rollingRows.value = finalTeam.map((r, i) => ({
    player: r.player,
    displayAgent: AGENTS[Math.floor(Math.random() * AGENTS.length)],
    locked: false,
    index: i,
  }))
  nextTick(() => scrollTo(rollingAreaRef.value))

  const LOCK_BASE     = 1000
  const LOCK_INTERVAL = 1000
  const SLOWDOWN_SPAN = 900

  finalTeam.forEach((final, idx) => {
    const lockAt     = LOCK_BASE + idx * LOCK_INTERVAL
    const slowdownAt = lockAt - SLOWDOWN_SPAN

    function tick(elapsed) {
      if (elapsed >= lockAt) {
        rollingRows.value[idx].displayAgent = final.agent
        rollingRows.value[idx].locked = true
        if (rollingRows.value.every(r => r.locked)) {
          setTimeout(() => {
            results.value     = finalTeam
            rollingRows.value = null
            isRolling.value   = false
            nextTick(() => scrollTo(resultAreaRef.value))
          }, 350)
        }
        return
      }
      rollingRows.value[idx].displayAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
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
    <h1 class="section-title">エージェント ランダム割り振り</h1>
    <p class="section-desc">5人用 — バンしたエージェントを除外してランダムに割り振ります</p>

    <!-- バンフェーズ -->
    <AgentBanBoard ref="banBoardRef" :disabled="isRolling" />

    <!-- プレイヤーリスト -->
    <div class="a5-card">
      <div class="a5-card__header">
        <span class="a5-card__dot"></span>
        <span class="a5-card__title">YOUR TEAM</span>
        <div class="preset-bar">
          <button
            v-for="p in ROLE_PRESETS" :key="p.key"
            class="preset-btn"
            :class="{ 'preset-btn--clr': p.key === 'clr' }"
            :title="p.desc"
            :disabled="isRolling"
            @click="applyPreset(p)"
          >{{ p.label }}</button>
        </div>
      </div>
      <div class="player-list">
        <div v-for="(player, idx) in team" :key="idx" class="player-block">
          <input
            class="player-row__input"
            type="text"
            :placeholder="player.placeholder"
            maxlength="20"
            v-model="player.name"
            :disabled="isRolling"
          />
          <div class="player-role-row">
            <div
              v-for="role in player.roles" :key="role.key"
              class="player-role-chip"
              :class="[`player-role-chip--${role.key}`, { 'player-role-chip--active': role.active }]"
              @click="toggleRole(player, role.key)"
            >{{ role.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <button class="btn-primary" @click="rollAgents" :disabled="isRolling">
      {{ isRolling ? '⚡ ROLLING...' : '⚡ 抽選開始' }}
    </button>

    <!-- ルーレット中 -->
    <div v-if="rollingRows" class="result-area" ref="rollingAreaRef">
      <div class="result-title">— ROLLING —</div>
      <div class="a5-rolling-grid">
        <div
          v-for="row in rollingRows" :key="row.index"
          class="a5-rolling-card"
          :class="{ 'a5-rolling-card--locked': row.locked }"
        >
          <img class="a5-rolling-card__portrait" :src="row.displayAgent.portrait" :alt="row.displayAgent.name" />
          <div class="a5-rolling-card__overlay" :class="`a5-rolling-card__overlay--${row.displayAgent.role}`" />
          <div v-if="row.locked" class="a5-rolling-card__lock">✓</div>
          <div class="a5-rolling-card__info">
            <div class="a5-rolling-card__player">{{ row.player }}</div>
            <div class="a5-rolling-card__name">{{ row.displayAgent.name }}</div>
            <div class="a5-rolling-card__role-badge" :class="`agent-role--${row.displayAgent.role}`">{{ ROLE_LABELS[row.displayAgent.role] }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 確定結果 -->
    <div v-if="results && !isRolling" class="result-area" ref="resultAreaRef">
      <div class="result-title">— 結果 —</div>
      <div class="a5-result-grid">
        <div
          v-for="(r, i) in results" :key="i"
          class="a5-result-card"
          :class="`a5-result-card--${r.agent.role}`"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <img class="a5-result-card__portrait" :src="r.agent.portrait" :alt="r.agent.name" />
          <div class="a5-result-card__overlay" :class="`a5-result-card__overlay--${r.agent.role}`" />
          <img class="a5-result-card__icon" :src="r.agent.icon" :alt="r.agent.name" />
          <div class="a5-result-card__info">
            <div class="a5-result-card__player">{{ r.player }}</div>
            <div class="a5-result-card__name">{{ r.agent.name }}</div>
            <div class="a5-result-card__role" :class="`agent-role--${r.agent.role}`">{{ ROLE_LABELS[r.agent.role] }}</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { AGENTS } from '../../constants/agents'
import { ROLE_LABELS, ROLES_INIT, ROLE_PRESETS } from '../../constants/roles'
import AgentBanBoard from '../../components/AgentBanBoard.vue'
import './Agent5v5.css'

const TEAM_SIZE = 5

const makePlayer = (n) => ({
  name: '',
  placeholder: `Player ${n}`,
  roles: ROLES_INIT.map(r => ({ ...r })),
})

// --- State ---
const teamAName = ref('TEAM A')
const teamBName = ref('TEAM B')
const teamA = reactive(Array.from({ length: TEAM_SIZE }, (_, i) => makePlayer(i + 1)))
const teamB = reactive(Array.from({ length: TEAM_SIZE }, (_, i) => makePlayer(i + 1)))

const banBoardRefA = ref(null)
const banBoardRefB = ref(null)

const results     = ref(null)
const rollingRows = ref(null)
const isRolling   = ref(false)
const error       = ref('')

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

function applyPreset(team, preset) {
  team.forEach((player, i) => {
    const assigned = preset.roles[i]
    player.roles.forEach(r => {
      r.active = assigned === null ? false : r.key === assigned
    })
  })
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

  const usedNames = []
  const calcTeam = (team, banned) =>
    team.map(p => {
      const pool  = getPool(p, banned, usedNames)
      const agent = pool[Math.floor(Math.random() * pool.length)]
      usedNames.push(agent.name)
      return { player: p.name.trim() || p.placeholder, agent }
    })

  const finalA = calcTeam(teamA, bannedA)
  const finalB = calcTeam(teamB, bannedB)

  isRolling.value   = true
  results.value     = null
  rollingRows.value = {
    a: finalA.map((r, i) => ({ player: r.player, displayAgent: AGENTS[Math.floor(Math.random() * AGENTS.length)], locked: false, index: i })),
    b: finalB.map((r, i) => ({ player: r.player, displayAgent: AGENTS[Math.floor(Math.random() * AGENTS.length)], locked: false, index: i })),
  }
  nextTick(() => scrollTo(rollingAreaRef.value))

  const LOCK_BASE     = 1000
  const LOCK_INTERVAL = 1000
  const SLOWDOWN_SPAN = 900
  let lockedCount = 0
  const totalPlayers = TEAM_SIZE * 2

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
    <h1 class="section-title">5 VS 5 エージェント割り振り</h1>
    <p class="section-desc">5v5 カスタムゲーム用 — 全10人にエージェントをランダム割り振りします</p>

    <!-- チーム入力 -->
    <div class="team-grid">

      <!-- TEAM A -->
      <div class="team-card team-card--a">
        <div class="team-card__header">
          <span class="team-card__dot team-card__dot--a"></span>
          <input class="team-card__name-input" v-model="teamAName" maxlength="12" :disabled="isRolling" />
          <div class="preset-bar">
            <button
              v-for="p in ROLE_PRESETS" :key="p.key"
              class="preset-btn"
              :class="{ 'preset-btn--clr': p.key === 'clr' }"
              :title="p.desc"
              :disabled="isRolling"
              @click="applyPreset(teamA, p)"
            >{{ p.label }}</button>
          </div>
        </div>
        <AgentBanBoard ref="banBoardRefA" :disabled="isRolling" />
        <div class="player-list">
          <div v-for="(player, idx) in teamA" :key="idx" class="player-block">
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

      <!-- VS -->
      <div class="vs-divider"><span>VS</span></div>

      <!-- TEAM B -->
      <div class="team-card team-card--b">
        <div class="team-card__header">
          <span class="team-card__dot team-card__dot--b"></span>
          <input class="team-card__name-input" v-model="teamBName" maxlength="12" :disabled="isRolling" />
          <div class="preset-bar">
            <button
              v-for="p in ROLE_PRESETS" :key="p.key"
              class="preset-btn"
              :class="{ 'preset-btn--clr': p.key === 'clr' }"
              :title="p.desc"
              :disabled="isRolling"
              @click="applyPreset(teamB, p)"
            >{{ p.label }}</button>
          </div>
        </div>
        <AgentBanBoard ref="banBoardRefB" :disabled="isRolling" />
        <div class="player-list">
          <div v-for="(player, idx) in teamB" :key="idx" class="player-block">
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

    </div>

    <div v-if="error" class="notice">{{ error }}</div>

    <button class="btn-primary" @click="rollAgents" :disabled="isRolling">
      {{ isRolling ? '⚡ ROLLING...' : '⚡ 抽選開始' }}
    </button>

    <!-- ルーレット中 -->
    <div v-if="rollingRows" class="result-area" ref="rollingAreaRef">
      <div class="result-title">— ROLLING —</div>
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

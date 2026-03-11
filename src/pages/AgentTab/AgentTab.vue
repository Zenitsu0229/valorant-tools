<script setup>
import { ref, reactive } from 'vue'
import { AGENTS } from '../../constants/agents'
import { ROLE_LABELS, ROLES_INIT, MAX_PLAYERS } from '../../constants/roles'
import './AgentTab.css'

let _idCounter = 0
const newPlayer = () => ({
  id: ++_idCounter,
  name: '',
  roles: ROLES_INIT.map(r => ({ ...r })),
})

// --- State ---
const players     = reactive([newPlayer(), newPlayer()])
const globalRoles = reactive(ROLES_INIT.map(r => ({ ...r })))
const noDuplicate = ref(false)
const results     = ref([])
const error       = ref('')

// --- プレイヤー操作 ---
function addPlayer() {
  if (players.length >= MAX_PLAYERS) return
  players.push(newPlayer())
}

function removePlayer(id) {
  if (players.length <= 1) return
  const idx = players.findIndex(p => p.id === id)
  if (idx !== -1) players.splice(idx, 1)
}

// --- 個別ロール ---
function togglePlayerRole(playerId, roleKey) {
  const player = players.find(p => p.id === playerId)
  if (!player) return
  const role = player.roles.find(r => r.key === roleKey)
  if (role) role.active = !role.active
}

function setAllPlayerRoles(playerId, active) {
  const player = players.find(p => p.id === playerId)
  if (!player) return
  player.roles.forEach(r => { r.active = active })
}

// --- 全体ロール ---
function toggleGlobalRole(key) {
  const role = globalRoles.find(r => r.key === key)
  if (role) role.active = !role.active
}

// --- ランダム割り振り ---
function rollAgents() {
  error.value = ''
  const globalActiveKeys = globalRoles.filter(r => r.active).map(r => r.key)

  const allEmpty = players.every(p => {
    const pKeys = p.roles.filter(r => r.active).map(r => r.key)
    const effective = globalActiveKeys.filter(k => pKeys.includes(k))
    return AGENTS.filter(a => effective.includes(a.role)).length === 0
  })
  if (allEmpty) {
    error.value = 'ロールを1つ以上選択してください'
    return
  }

  const newResults = []

  players.forEach((p, i) => {
    const pKeys = p.roles.filter(r => r.active).map(r => r.key)
    const effectiveKeys = globalActiveKeys.filter(k => pKeys.includes(k))
    let pool = AGENTS.filter(a => effectiveKeys.includes(a.role))
    if (pool.length === 0) pool = AGENTS.filter(a => globalActiveKeys.includes(a.role))

    const playerName = p.name.trim() || `Player ${i + 1}`

    if (noDuplicate.value) {
      const usedNames = newResults.map(r => r.agent.name)
      const available = pool.filter(a => !usedNames.includes(a.name))
      const from = available.length > 0 ? available : pool
      newResults.push({ player: playerName, agent: from[Math.floor(Math.random() * from.length)] })
    } else {
      newResults.push({ player: playerName, agent: pool[Math.floor(Math.random() * pool.length)] })
    }
  })

  results.value = newResults
}
</script>

<template>
  <div>
    <div class="section-title">エージェント ランダム割り振り</div>
    <div class="section-desc">
      プレイヤー名を入力して、エージェントをランダムに割り振ります（最大{{ MAX_PLAYERS }}人）
    </div>

    <!-- プレイヤー入力 -->
    <div class="card">
      <div class="input-label">プレイヤー名 / 個別ロール</div>
      <div class="player-inputs">
        <div
          v-for="(player, idx) in players"
          :key="player.id"
          class="player-block"
        >
          <div class="player-row">
            <input
              class="player-row__input"
              type="text"
              :placeholder="`Player ${idx + 1}`"
              maxlength="20"
              v-model="player.name"
            />
            <button
              class="player-row__remove"
              @click="removePlayer(player.id)"
              :disabled="players.length <= 1"
            >✕</button>
          </div>
          <!-- 個別ロールチップ -->
          <div class="player-role-row">
            <div class="player-role-bulk-btns">
              <button class="player-role-bulk-btn" @click="setAllPlayerRoles(player.id, true)">全ON</button>
              <button class="player-role-bulk-btn player-role-bulk-btn--off" @click="setAllPlayerRoles(player.id, false)">全OFF</button>
            </div>
            <div
              v-for="role in player.roles"
              :key="role.key"
              class="player-role-chip"
              :class="[`player-role-chip--${role.key}`, { 'player-role-chip--active': role.active }]"
              @click="togglePlayerRole(player.id, role.key)"
            >{{ role.label }}</div>
          </div>
        </div>
      </div>
      <button
        class="add-player-btn"
        @click="addPlayer"
        :disabled="players.length >= MAX_PLAYERS"
      >
        ＋ プレイヤーを追加（最大{{ MAX_PLAYERS }}人）
      </button>
    </div>

    <!-- 全体ロール絞り込み -->
    <div class="card">
      <div class="input-label" style="margin-bottom: 12px">
        全体ロール絞り込み（全プレイヤーに適用）
      </div>
      <div class="filter-row">
        <div
          v-for="role in globalRoles"
          :key="role.key"
          class="filter-chip"
          :class="{ 'filter-chip--active': role.active }"
          @click="toggleGlobalRole(role.key)"
        >{{ role.label }}</div>
      </div>

      <div class="input-label" style="margin-bottom: 12px">オプション</div>
      <div class="filter-row">
        <div
          class="filter-chip"
          :class="{ 'filter-chip--active': noDuplicate }"
          @click="noDuplicate = !noDuplicate"
        >重複なし</div>
      </div>
    </div>

    <div v-if="error" class="notice">{{ error }}</div>

    <button class="btn-primary" @click="rollAgents">
      ⚡ エージェントをランダムに割り振る
    </button>

    <!-- 結果 -->
    <div v-if="results.length > 0" class="result-area">
      <div class="result-title">— 結果 —</div>
      <div class="agent-results">
        <div
          v-for="(r, i) in results"
          :key="i"
          class="agent-result-row"
          :style="{ animationDelay: `${i * 80}ms` }"
        >
          <div class="agent-result-row__player">{{ r.player }}</div>
          <div class="agent-result-row__arrow">→</div>
          <div class="agent-result-row__name">{{ r.agent.name }}</div>
          <div class="agent-role" :class="`agent-role--${r.agent.role}`">
            {{ ROLE_LABELS[r.agent.role] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

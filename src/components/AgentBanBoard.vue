<script setup>
import { reactive, computed } from 'vue'
import { AGENTS } from '../constants/agents'
import { ROLE_LABELS } from '../constants/roles'
import './AgentBanBoard.css'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})

const ROLES_ORDER = ['duelist', 'initiator', 'controller', 'sentinel']

const banned = reactive(new Set())

const agentsByRole = ROLES_ORDER.map(role => ({
  role,
  label: ROLE_LABELS[role],
  agents: AGENTS.filter(a => a.role === role),
}))

const banCount = computed(() => banned.size)

function toggleBan(name) {
  if (props.disabled) return
  if (banned.has(name)) {
    banned.delete(name)
  } else {
    banned.add(name)
  }
}

function clearBans() {
  banned.clear()
}

defineExpose({ banned })
</script>

<template>
  <div class="ban-board">
    <div class="ban-board__header">
      <span class="ban-board__title">BAN PHASE</span>
      <div class="ban-board__meta">
        <span class="ban-board__count" :class="{ 'ban-board__count--active': banCount > 0 }">
          {{ banCount }} BANNED
        </span>
        <button class="ban-board__clear" @click="clearBans" :disabled="disabled || banCount === 0">
          クリア
        </button>
      </div>
    </div>

    <div class="ban-board__body">
      <div v-for="group in agentsByRole" :key="group.role" class="ban-role-group">
        <div class="ban-role-group__label" :class="`ban-role-group__label--${group.role}`">
          {{ group.label }}
        </div>
        <div class="ban-role-group__grid">
          <div
            v-for="agent in group.agents"
            :key="agent.name"
            class="ban-agent"
            :class="{ 'ban-agent--banned': banned.has(agent.name) }"
            @click="toggleBan(agent.name)"
          >
            <img class="ban-agent__img" :src="agent.icon" :alt="agent.name" loading="lazy" />
            <div class="ban-agent__x" v-if="banned.has(agent.name)" />
            <div class="ban-agent__name">{{ agent.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

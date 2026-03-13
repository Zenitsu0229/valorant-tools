<script setup>
import { ref, reactive, computed } from 'vue'
import { AGENTS } from '@/constants/agents'
import { ROLE_LABELS } from '@/constants/roles'
import './AgentBanBoard.css'

// 親コンポーネントから受け取るプロパティ
const props = defineProps({
  disabled:    { type: Boolean, default: false }, // ルーレット中は操作を無効化
  defaultOpen: { type: Boolean, default: false }, // 初期表示時に展開しておくか
})

// ロールの表示順（BANボード内のグループ順序）
const ROLES_ORDER = ['duelist', 'initiator', 'controller', 'sentinel']

// BAN 済みエージェント名の集合（Set は重複を自動で排除する）
const banned = reactive(new Set())

// アコーディオンの開閉状態（props.defaultOpen で初期値を設定）
const isOpen = ref(props.defaultOpen)

// ロールごとにエージェントをグループ化した配列（描画に使用）
const agentsByRole = ROLES_ORDER.map(role => ({
  role,
  label:  ROLE_LABELS[role],
  agents: AGENTS.filter(a => a.role === role),
}))

// 現在の BAN 数（リアクティブなカウント表示用）
const banCount = computed(() => banned.size)

// エージェントの BAN / BAN解除 を切り替える
function toggleBan(name) {
  if (props.disabled) return // ルーレット中は操作不可
  if (banned.has(name)) banned.delete(name)
  else                  banned.add(name)
}

// 全 BAN をリセットする
function clearBans() {
  banned.clear()
}

// 親コンポーネントが ref 経由で banned Set を参照できるように公開
defineExpose({ banned })
</script>

<template>
  <div class="ban-board">
    <!-- ヘッダー（クリックでアコーディオン開閉） -->
    <div class="ban-board__header" @click="isOpen = !isOpen" role="button" :aria-expanded="isOpen">
      <div class="ban-board__header-left">
        <!-- 矢印アイコン（open 時に回転） -->
        <svg
          class="ban-board__chevron"
          :class="{ 'ban-board__chevron--open': isOpen }"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span class="ban-board__title">BAN PHASE</span>
      </div>
      <!-- @click.stop でヘッダークリックのアコーディオン動作を伝播させない -->
      <div class="ban-board__meta" @click.stop>
        <span class="ban-board__count" :class="{ 'ban-board__count--active': banCount > 0 }">
          {{ banCount }} BANNED
        </span>
        <button class="ban-board__clear" @click="clearBans" :disabled="disabled || banCount === 0">
          クリア
        </button>
      </div>
    </div>

    <!-- 本体（アコーディオン。--closed クラスで CSS の max-height を 0 にして折りたたむ） -->
    <div class="ban-board__body-wrap" :class="{ 'ban-board__body-wrap--closed': !isOpen }">
      <div class="ban-board__body">
        <!-- ロールごとにエージェントを表示 -->
        <div v-for="group in agentsByRole" :key="group.role" class="ban-role-group">
          <div class="ban-role-group__label" :class="`ban-role-group__label--${group.role}`">
            {{ group.label }}
          </div>
          <div class="ban-role-group__grid">
            <!-- クリックで toggleBan() を呼び出し、BAN 状態をクラスで反映 -->
            <div
              v-for="agent in group.agents"
              :key="agent.name"
              class="ban-agent"
              :class="{ 'ban-agent--banned': banned.has(agent.name) }"
              @click="toggleBan(agent.name)"
            >
              <img class="ban-agent__img" :src="agent.icon" :alt="agent.name" loading="lazy" />
              <!-- BAN 時のバツ印オーバーレイ -->
              <div class="ban-agent__x" v-if="banned.has(agent.name)" />
              <div class="ban-agent__name">{{ agent.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

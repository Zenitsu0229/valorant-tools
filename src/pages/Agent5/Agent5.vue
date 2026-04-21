<script setup>
import { ref, reactive, nextTick } from 'vue'
import { AGENTS } from '@/constants/agents'
import { ROLE_LABELS, ROLES_INIT, ROLE_PRESETS } from '@/constants/roles'
import AgentBanBoard from '@/components/AgentBanBoard.vue'
import './Agent5.css'

// プレイヤー数の上限・下限
const MAX_SIZE = 5
const MIN_SIZE = 1

// プレイヤーオブジェクトのファクトリ関数
// n: 1始まりのプレイヤー番号（プレースホルダー名に使用）
const makePlayer = (n) => ({
  name:        '',
  placeholder: `Player ${n}`,
  roles:       ROLES_INIT.map(r => ({ ...r })), // ディープコピーで各プレイヤーが独立した状態を持つ
})

// ---- 状態管理 ----
const team        = reactive(Array.from({ length: MAX_SIZE }, (_, i) => makePlayer(i + 1)))
const results     = ref(null)   // 確定結果 [{ player, agent }]
const rollingRows = ref(null)   // ルーレット中の表示データ
const isRolling   = ref(false)  // ルーレット中フラグ（操作ロックに使用）

// DOM 参照（スクロール制御・フォーカス管理に使用）
const banBoardRef    = ref(null)
const rollBtnRef     = ref(null)
const rollingAreaRef = ref(null)
const resultAreaRef  = ref(null)
const playerListRef  = ref(null)

// Enter キーで次の入力フィールドへフォーカスを移動
function focusNextInput(idx) {
  const inputs = playerListRef.value?.querySelectorAll('input[type="text"]')
  if (inputs?.[idx + 1]) inputs[idx + 1].focus()
}

// ヘッダーの高さを考慮しながらスムーズスクロール
function scrollTo(el) {
  if (!el) return
  const headerH = document.querySelector('.sticky-top')?.offsetHeight ?? 0
  const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12
  window.scrollTo({ top, behavior: 'smooth' })
}

// ---- 一括入力 ----
const activePreset  = ref(null)
const showBulkInput = ref(false)
const bulkNames     = ref(Array.from({ length: MAX_SIZE }, () => ''))

// 一括入力パネルの表示切り替え（開くたびに入力フィールドをリセット）
function toggleBulkInput() {
  showBulkInput.value = !showBulkInput.value
  if (showBulkInput.value) {
    bulkNames.value = Array.from({ length: MAX_SIZE }, () => '')
  }
}

// 一括入力を適用してプレイヤーリストに反映
function applyBulk() {
  const names = bulkNames.value.map(n => n.trim()).filter(n => n)
  if (!names.length) return
  // 入力人数に合わせてチームサイズを調整（MIN_SIZE〜MAX_SIZE の範囲に収める）
  const newSize = Math.min(Math.max(names.length, MIN_SIZE), MAX_SIZE)
  while (team.length < newSize) team.push(makePlayer(team.length + 1))
  while (team.length > newSize) team.pop()
  names.forEach((name, i) => { if (i < team.length) team[i].name = name })
  bulkNames.value = Array.from({ length: MAX_SIZE }, () => '')
  showBulkInput.value = false
}

// 複数行テキストの貼り付けを検知して自動適用
// 「1人目：名前」形式のプレフィックスは自動的に除去する
function onBulkPaste(e, startIdx) {
  const text  = e.clipboardData?.getData('text') ?? ''
  const lines = text.split('\n').map(l => l.replace(/^\d+人目[：:]\s*/, '').trim())
  if (lines.length <= 1) return // 1行のみなら通常ペーストに任せる
  e.preventDefault()
  lines.forEach((name, i) => {
    const idx = startIdx + i
    if (idx < MAX_SIZE) bulkNames.value[idx] = name
  })
  nextTick(applyBulk)
}

// ---- プレイヤー追加・削除 ----
function addPlayer() {
  if (isRolling.value || team.length >= MAX_SIZE) return
  team.push(makePlayer(team.length + 1))
}

function removePlayer() {
  if (isRolling.value || team.length <= MIN_SIZE) return
  team.pop()
}

// ---- ロール操作 ----
// 個別にロールチップをクリックしたときの処理（プリセット選択状態はリセット）
function toggleRole(player, roleKey) {
  const r = player.roles.find(r => r.key === roleKey)
  if (r) r.active = !r.active
  activePreset.value = null
}

// プリセットを適用してチーム全体のロール設定を一括変更
function applyPreset(preset) {
  team.forEach((player, i) => {
    const assigned = preset.roles[i]
    player.roles.forEach(r => {
      // assigned が null なら全ロールOFF、そうでなければ一致するロールのみ ON
      r.active = assigned === null ? false : r.key === assigned
    })
  })
  activePreset.value = preset.key
}

// ---- エージェントプール取得 ----
/**
 * 指定プレイヤーが選べるエージェントの候補一覧を返す
 * フォールバック優先順位:
 *   1. ロール絞り込み + BAN除外
 *   2. BAN除外のみ（ロール指定なし）
 *   3. 全エージェント（BAN全解除）
 * さらに usedNames（既に割り振られたエージェント）を除外して重複を防ぐ
 */
function getPool(player, usedNames = []) {
  const banned     = banBoardRef.value?.banned ?? new Set()
  const activeKeys = player.roles.filter(r => r.active).map(r => r.key)

  let pool = AGENTS.filter(a => activeKeys.includes(a.role) && !banned.has(a.name))
  if (pool.length === 0) pool = AGENTS.filter(a => !banned.has(a.name))
  if (pool.length === 0) pool = [...AGENTS] // BAN が多すぎる場合の最終フォールバック

  pool = pool.filter(a => !usedNames.includes(a.name)) // 重複排除
  if (pool.length === 0) pool = AGENTS.filter(a => !banned.has(a.name))
  if (pool.length === 0) pool = [...AGENTS]

  return pool
}

// ---- ルーレット演出定数 ----
const LOCK_BASE     = 1000 // 最初のプレイヤーがロックされるまでの時間（ms）
const LOCK_INTERVAL = 1000 // プレイヤーごとのロック間隔（ms）
const SLOWDOWN_SPAN = 900  // ロック前にスローダウンを開始するタイミング（ms 前から）
const LOCK_DELAY    = 350  // 全員ロック後、結果表示に切り替えるまでの待機時間（ms）

// ---- ランダム割り振り & ルーレット開始 ----
function rollAgents() {
  if (isRolling.value) return

  // 先に最終結果を確定させてからアニメーションを開始する（ズレ防止）
  const usedNames = []
  const finalTeam = team.map(p => {
    const pool  = getPool(p, usedNames)
    const agent = pool[Math.floor(Math.random() * pool.length)]
    usedNames.push(agent.name)
    return { player: p.name.trim() || p.placeholder, agent }
  })

  results.value     = null
  isRolling.value   = true
  // ルーレット表示の初期データ（ランダムなエージェントで初期化）
  rollingRows.value = finalTeam.map((r, i) => ({
    player:       r.player,
    displayAgent: AGENTS[Math.floor(Math.random() * AGENTS.length)],
    locked:       false,
    index:        i,
  }))
  nextTick(() => scrollTo(rollBtnRef.value))

  // 各プレイヤーの tick アニメーションを開始
  finalTeam.forEach((final, idx) => {
    const lockAt     = LOCK_BASE + idx * LOCK_INTERVAL
    const slowdownAt = lockAt - SLOWDOWN_SPAN

    /**
     * 再帰的な setTimeout でルーレットを表現する
     * elapsed: 開始からの経過時間（ms）
     * - elapsed < slowdownAt: 高速（50ms 間隔）で切り替え
     * - slowdownAt 以降: 累乗的に遅くなり lockAt で停止
     */
    function tick(elapsed) {
      if (elapsed >= lockAt) {
        // ロック処理：最終エージェントを確定表示
        rollingRows.value[idx].displayAgent = final.agent
        rollingRows.value[idx].locked = true
        // 全プレイヤーがロックされたら結果表示へ切り替え
        if (rollingRows.value.every(r => r.locked)) {
          setTimeout(() => {
            results.value     = finalTeam
            rollingRows.value = null
            isRolling.value   = false
            nextTick(() => scrollTo(resultAreaRef.value))
          }, LOCK_DELAY)
        }
        return
      }
      // ランダムなエージェントを表示し続ける（高速回転）
      rollingRows.value[idx].displayAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
      // スローダウン計算: Math.pow で滑らかに減速
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
    <h1 class="section-title">VALORANTエージェント ランダムピック | バン・ロール指定対応【無料】</h1>
    <p class="section-desc">VALORANTのエージェント（キャラ）をルーレットでランダムピック。バン機能でキャラを除外・ロール指定（デュエリスト/イニシエーター/コントローラー/センチネル）で絞り込み可能。1〜5人対応。縛りプレイ・トロールルーレットにも最適。</p>

    <!-- バンフェーズ（ルーレット中は disabled） -->
    <AgentBanBoard ref="banBoardRef" :disabled="isRolling" />

    <!-- プレイヤーリスト -->
    <div class="a5-card">
      <div class="a5-card__header">
        <span class="a5-card__dot"></span>
        <span class="a5-card__title">YOUR TEAM</span>
        <!-- プレイヤー人数コントロール -->
        <div class="size-control">
          <button class="size-btn" @click="removePlayer" :disabled="isRolling || team.length <= 1">−</button>
          <span class="size-display">{{ team.length }}<span class="size-max">/5</span></span>
          <button class="size-btn" @click="addPlayer"    :disabled="isRolling || team.length >= 5">＋</button>
        </div>
        <!-- ロールプリセットボタン群 -->
        <div class="preset-bar">
          <button
            v-for="p in ROLE_PRESETS" :key="p.key"
            class="preset-btn"
            :class="{ 'preset-btn--clr': p.key === 'clr', 'preset-btn--active': activePreset === p.key }"
            :title="p.desc"
            :disabled="isRolling"
            @click="applyPreset(p)"
          >{{ p.label }}</button>
        </div>
        <!-- 一括入力パネルのトグルボタン -->
        <button
          class="bulk-toggle-btn"
          :class="{ 'bulk-toggle-btn--active': showBulkInput }"
          :disabled="isRolling"
          @click="toggleBulkInput"
        >📋 一括入力</button>
      </div>

      <!-- 一括入力パネル（Transition でスライドイン） -->
      <Transition name="bulk-panel">
        <div v-if="showBulkInput" class="bulk-panel">
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

      <!-- 個別プレイヤー入力行 -->
      <div class="player-list" ref="playerListRef">
        <div v-for="(player, idx) in team" :key="idx" class="player-block">
          <span class="player-num">{{ String(idx + 1).padStart(2, '0') }}</span>
          <div class="player-block__inner">
            <input
              class="player-row__input"
              type="text"
              :placeholder="player.placeholder"
              maxlength="20"
              v-model="player.name"
              :disabled="isRolling"
              @keydown.enter="focusNextInput(idx)"
            />
            <!-- ロールフィルターチップ（クリックで ON/OFF） -->
            <div class="player-role-row">
              <div
                v-for="role in player.roles" :key="role.key"
                class="player-role-chip"
                :class="[`player-role-chip--${role.key}`, { 'player-role-chip--active': role.active }]"
                @click="!isRolling && toggleRole(player, role.key)"
              >{{ role.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 抽選ボタン（ルーレット中はテキストが変わり disabled） -->
    <button class="btn-primary" ref="rollBtnRef" @click="rollAgents" :disabled="isRolling">
      {{ isRolling ? '⚡ ROLLING...' : '⚡ 抽選開始' }}
    </button>

    <!-- ルーレット演出エリア（isRolling かつ rollingRows がある間表示） -->
    <div v-if="rollingRows" class="result-area" ref="rollingAreaRef">
      <div class="rolling-label">
        <span class="rolling-label__dot"></span>
        ASSIGNING AGENTS
        <span class="rolling-label__dot"></span>
      </div>
      <div class="a5-rolling-grid">
        <div
          v-for="row in rollingRows" :key="row.index"
          class="a5-rolling-card"
          :class="{ 'a5-rolling-card--locked': row.locked }"
        >
          <img class="a5-rolling-card__portrait" :src="row.displayAgent.portrait" :alt="row.displayAgent.name" />
          <!-- ロールごとの色オーバーレイ -->
          <div class="a5-rolling-card__overlay" :class="`a5-rolling-card__overlay--${row.displayAgent.role}`" />
          <!-- ロック済みの場合はチェックマークを表示 -->
          <div v-if="row.locked" class="a5-rolling-card__lock">✓</div>
          <div class="a5-rolling-card__info">
            <div class="a5-rolling-card__player">{{ row.player }}</div>
            <div class="a5-rolling-card__name">{{ row.displayAgent.name }}</div>
            <div class="a5-rolling-card__role-badge" :class="`agent-role--${row.displayAgent.role}`">{{ ROLE_LABELS[row.displayAgent.role] }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 確定結果エリア（ルーレット完了後に表示） -->
    <div v-if="results && !isRolling" class="result-area" ref="resultAreaRef">
      <div class="result-title">— 結果 —</div>
      <div class="a5-result-grid">
        <div
          v-for="(r, i) in results" :key="i"
          class="a5-result-card"
          :class="`a5-result-card--${r.agent.role}`"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <img class="a5-result-card__portrait" :src="r.agent.portrait" :alt="`${r.agent.name} - VALORANT ${ROLE_LABELS[r.agent.role]}`" />
          <div class="a5-result-card__overlay" :class="`a5-result-card__overlay--${r.agent.role}`" />
          <img class="a5-result-card__icon" :src="r.agent.icon" :alt="r.agent.name" />
          <div class="a5-result-card__info">
            <div class="a5-result-card__player">{{ r.player }}</div>
            <div class="a5-result-card__name">{{ r.agent.name }}</div>
            <div class="a5-result-card__role" :class="`agent-role--${r.agent.role}`">{{ ROLE_LABELS[r.agent.role] }}</div>
          </div>
        </div>
      </div>

      <!-- SNS シェアボタン -->
      <div class="share-bar">
        <a
          class="share-btn share-btn--x"
          :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent('VALORANTランダムピックで抽選しました！ #VALORANT #ヴァロラント')}&url=${encodeURIComponent('https://valorant-tools-two.vercel.app/')}`"
          target="_blank"
          rel="noopener noreferrer"
        >𝕏 でシェア</a>
        <a
          class="share-btn share-btn--line"
          :href="`https://line.me/R/msg/text/?${encodeURIComponent('VALORANTランダムピック！ https://valorant-tools-two.vercel.app/')}`"
          target="_blank"
          rel="noopener noreferrer"
        >LINE でシェア</a>
      </div>
    </div>

  </div>
</template>

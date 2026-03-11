import { useState } from 'react'
import { AGENTS } from '../../constants/agents'
import { ROLE_LABELS, ROLES_INIT, MAX_PLAYERS } from '../../constants/roles'
import './AgentTab.css'

let _idCounter = 0
const newPlayer = () => ({
  id: ++_idCounter,
  name: '',
  roles: ROLES_INIT.map(r => ({ ...r })), // プレイヤー個別ロールフィルター
})

export default function AgentTab() {
  const [players, setPlayers]   = useState([newPlayer(), newPlayer()])
  const [roles, setRoles]       = useState(ROLES_INIT)   // 全体フィルター
  const [noDuplicate, setNoDup] = useState(false)
  const [results, setResults]   = useState([])
  const [error, setError]       = useState('')

  // --- プレイヤー操作 ---
  const addPlayer = () => {
    if (players.length >= MAX_PLAYERS) return
    setPlayers(prev => [...prev, newPlayer()])
  }

  const removePlayer = (id) => {
    if (players.length <= 1) return
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  const updatePlayer = (id, name) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p))
  }

  // --- 個別ロール切替 ---
  const togglePlayerRole = (playerId, roleKey) => {
    setPlayers(prev => prev.map(p =>
      p.id !== playerId ? p : {
        ...p,
        roles: p.roles.map(r => r.key === roleKey ? { ...r, active: !r.active } : r),
      }
    ))
  }

  // --- 個別ロール 全ON / 全OFF ---
  const setAllPlayerRoles = (playerId, active) => {
    setPlayers(prev => prev.map(p =>
      p.id !== playerId ? p : {
        ...p,
        roles: p.roles.map(r => ({ ...r, active })),
      }
    ))
  }

  // --- 全体ロール切替 ---
  const toggleRole = (key) => {
    setRoles(prev => prev.map(r => r.key === key ? { ...r, active: !r.active } : r))
  }

  // --- ランダム割り振り ---
  const rollAgents = () => {
    setError('')
    const globalActiveRoles = roles.filter(r => r.active).map(r => r.key)

    // 全プレイヤーで有効なプールが1つもなければ早期エラー
    const allEmpty = players.every(p => {
      const playerRoles = p.roles.filter(r => r.active).map(r => r.key)
      const effective = globalActiveRoles.filter(k => playerRoles.includes(k))
      return AGENTS.filter(a => effective.includes(a.role)).length === 0
    })
    if (allEmpty) {
      setError('ロールを1つ以上選択してください')
      return
    }

    const newResults = []

    players.forEach((p, i) => {
      // 全体フィルター × 個別フィルターの積でプールを構築
      const playerRoles = p.roles.filter(r => r.active).map(r => r.key)
      const effectiveRoles = globalActiveRoles.filter(k => playerRoles.includes(k))
      let pool = AGENTS.filter(a => effectiveRoles.includes(a.role))

      // 個別プールが空の場合は全体プールにフォールバック
      if (pool.length === 0) {
        pool = AGENTS.filter(a => globalActiveRoles.includes(a.role))
      }

      const playerName = p.name.trim() || `Player ${i + 1}`

      if (noDuplicate) {
        // 重複なしは全プールから既出を除いて抽選
        const usedNames = newResults.map(r => r.agent.name)
        const available = pool.filter(a => !usedNames.includes(a.name))
        const from = available.length > 0 ? available : pool
        newResults.push({ player: playerName, agent: from[Math.floor(Math.random() * from.length)] })
      } else {
        newResults.push({ player: playerName, agent: pool[Math.floor(Math.random() * pool.length)] })
      }
    })

    setResults(newResults)
  }

  return (
    <div>
      <div className="section-title">エージェント ランダム割り振り</div>
      <div className="section-desc">
        プレイヤー名を入力して、エージェントをランダムに割り振ります（最大{MAX_PLAYERS}人）
      </div>

      {/* プレイヤー入力 */}
      <div className="card">
        <div className="input-label">プレイヤー名 / 個別ロール</div>
        <div className="player-inputs">
          {players.map((player, idx) => (
            <div className="player-block" key={player.id}>
              {/* 名前入力 + 削除ボタン */}
              <div className="player-row">
                <input
                  className="player-row__input"
                  type="text"
                  placeholder={`Player ${idx + 1}`}
                  maxLength={20}
                  value={player.name}
                  onChange={e => updatePlayer(player.id, e.target.value)}
                />
                <button
                  className="player-row__remove"
                  onClick={() => removePlayer(player.id)}
                  disabled={players.length <= 1}
                >✕</button>
              </div>
              {/* 個別ロールチップ */}
              <div className="player-role-row">
                <div className="player-role-bulk-btns">
                  <button
                    className="player-role-bulk-btn"
                    onClick={() => setAllPlayerRoles(player.id, true)}
                  >全ON</button>
                  <button
                    className="player-role-bulk-btn player-role-bulk-btn--off"
                    onClick={() => setAllPlayerRoles(player.id, false)}
                  >全OFF</button>
                </div>
                {player.roles.map(role => (
                  <div
                    key={role.key}
                    className={`player-role-chip player-role-chip--${role.key}${role.active ? ' player-role-chip--active' : ''}`}
                    onClick={() => togglePlayerRole(player.id, role.key)}
                  >
                    {role.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          className="add-player-btn"
          onClick={addPlayer}
          disabled={players.length >= MAX_PLAYERS}
        >
          ＋ プレイヤーを追加（最大{MAX_PLAYERS}人）
        </button>
      </div>

      {/* 全体ロール絞り込み（既存） */}
      <div className="card">
        <div className="input-label" style={{ marginBottom: 12 }}>
          全体ロール絞り込み（全プレイヤーに適用）
        </div>
        <div className="filter-row">
          {roles.map(role => (
            <div
              key={role.key}
              className={`filter-chip${role.active ? ' filter-chip--active' : ''}`}
              onClick={() => toggleRole(role.key)}
            >
              {role.label}
            </div>
          ))}
        </div>

        <div className="input-label" style={{ marginBottom: 12 }}>オプション</div>
        <div className="filter-row">
          <div
            className={`filter-chip${noDuplicate ? ' filter-chip--active' : ''}`}
            onClick={() => setNoDup(v => !v)}
          >
            重複なし
          </div>
        </div>
      </div>

      {error && <div className="notice">{error}</div>}

      <button className="btn-primary" onClick={rollAgents}>
        ⚡ エージェントをランダムに割り振る
      </button>

      {/* 結果 */}
      {results.length > 0 && (
        <div className="result-area">
          <div className="result-title">— 結果 —</div>
          <div className="agent-results">
            {results.map((r, i) => (
              <div
                key={i}
                className="agent-result-row"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="agent-result-row__player">{r.player}</div>
                <div className="agent-result-row__arrow">→</div>
                <div className="agent-result-row__name">{r.agent.name}</div>
                <div className={`agent-role agent-role--${r.agent.role}`}>
                  {ROLE_LABELS[r.agent.role]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** ロールキーと日本語ラベルのマッピング */
export const ROLE_LABELS = {
  duelist:    'デュエリスト',
  initiator:  'イニシエーター',
  controller: 'コントローラー',
  sentinel:   'センチネル',
}

/** フィルターチップの初期状態 */
export const ROLES_INIT = [
  { key: 'duelist',    label: 'デュエリスト',   active: false },
  { key: 'initiator',  label: 'イニシエーター',  active: false },
  { key: 'controller', label: 'コントローラー',  active: false },
  { key: 'sentinel',   label: 'センチネル',      active: false },
]

/**
 * ロールプリセット
 * roles[i] = そのプレイヤースロットに割り当てるロールキー
 * null = 全ロールON（制限なし）
 */
export const ROLE_PRESETS = [
  { key: '2d', label: '2D', desc: '2デュエリスト',   roles: ['duelist','duelist','initiator','controller','sentinel'] },
  { key: '2i', label: '2I', desc: '2イニシエーター', roles: ['duelist','initiator','initiator','controller','sentinel'] },
  { key: '2c', label: '2C', desc: '2コントローラー', roles: ['duelist','initiator','controller','controller','sentinel'] },
  { key: '2s', label: '2S', desc: '2センチネル',     roles: ['duelist','initiator','controller','sentinel','sentinel'] },
  { key: 'clr', label: 'CLR', desc: '全解除',        roles: [null, null, null, null, null] },
]

/** プレイヤーの最大人数 */
export const MAX_PLAYERS = 5

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

/** プレイヤーの最大人数 */
export const MAX_PLAYERS = 5

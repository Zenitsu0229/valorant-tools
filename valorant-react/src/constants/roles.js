/** ロールキーと日本語ラベルのマッピング */
export const ROLE_LABELS = {
  duelist:    'デュエリスト',
  initiator:  'イニシエーター',
  controller: 'コントローラー',
  sentinel:   'センチネル',
}

/** フィルターチップの初期状態 */
export const ROLES_INIT = [
  { key: 'duelist',    label: 'デュエリスト',   active: true },
  { key: 'initiator',  label: 'イニシエーター',  active: true },
  { key: 'controller', label: 'コントローラー',  active: true },
  { key: 'sentinel',   label: 'センチネル',      active: true },
]

/** プレイヤーの最大人数 */
export const MAX_PLAYERS = 5

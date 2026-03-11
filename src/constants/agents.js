/** @type {{ name: string, role: 'duelist' | 'initiator' | 'controller' | 'sentinel' }[]} */
export const AGENTS = [
  // デュエリスト
  { name: 'ジェット',     role: 'duelist' },
  { name: 'フェニックス', role: 'duelist' },
  { name: 'レイズ',       role: 'duelist' },
  { name: 'レイナ',       role: 'duelist' },
  { name: 'ネオン',       role: 'duelist' },
  { name: 'ヨル',         role: 'duelist' },
  { name: 'アイソ',       role: 'duelist' },
  { name: 'ウェイレイ',   role: 'duelist' },
  // イニシエーター
  { name: 'ソーヴァ',     role: 'initiator' },
  { name: 'ブリーチ',     role: 'initiator' },
  { name: 'スカイ',       role: 'initiator' },
  { name: 'フェイド',     role: 'initiator' },
  { name: 'ゲッコー',     role: 'initiator' },
  { name: 'KAY/O',        role: 'initiator' },
  // コントローラー
  { name: 'ブリムストーン', role: 'controller' },
  { name: 'ヴァイパー',   role: 'controller' },
  { name: 'オーメン',     role: 'controller' },
  { name: 'アストラ',     role: 'controller' },
  { name: 'ハーバー',     role: 'controller' },
  { name: 'クローヴ',     role: 'controller' },
  // センチネル
  { name: 'キルジョイ',   role: 'sentinel' },
  { name: 'セージ',       role: 'sentinel' },
  { name: 'サイファー',   role: 'sentinel' },
  { name: 'チェンバー',   role: 'sentinel' },
  { name: 'デッドロック', role: 'sentinel' },
  { name: 'ヴァイン',     role: 'sentinel' },
]

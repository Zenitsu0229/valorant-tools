/**
 * ハンデ一覧
 * target: 'strong' = 強チーム(TEAM A)への制約 / 'weak' = 弱チーム(TEAM B)へのボーナス / 'both' = 両チームへの制約
 * 追加する場合はこのファイルにオブジェクトを追記するだけでOK
 */
export const HANDICAPS = [
  // ===== 移動系 =====
  {
    id:     'walk-only',
    icon:   '🚶',
    label:  '歩き縛り',
    desc:   '強チームは常に歩き移動のみ（シフト歩き可）。走りは禁止。',
    target: 'strong',
  },
  {
    id:     'no-jump',
    icon:   '⬇',
    label:  'ジャンプ禁止',
    desc:   '強チームはジャンプ禁止。段差の上り下りは歩いて行える範囲のみ。',
    target: 'strong',
  },

  // ===== 武器系 =====
  {
    id:     'pistol-only',
    icon:   '🔫',
    label:  'ピストルのみ',
    desc:   '強チームはピストル（クラシック / ショーティ / フレンジー / ゴースト / シェリフ）のみ購入可。',
    target: 'strong',
  },
  {
    id:     'knife-only',
    icon:   '🔪',
    label:  'ナイフのみ',
    desc:   '強チームは近接攻撃（ナイフ）のみ使用可。銃の購入・使用禁止。',
    target: 'strong',
  },
  {
    id:     'no-rifle',
    icon:   '🚫',
    label:  'ライフル禁止',
    desc:   '強チームはライフル系（ヴァンダル / ファントム / ガーディアン等）の購入禁止。',
    target: 'strong',
  },
  {
    id:     'shotgun-only',
    icon:   '💥',
    label:  'ショットガンのみ',
    desc:   '強チームはショットガン（バッキー / ジャッジ）のみ購入可。',
    target: 'strong',
  },

  // ===== 装備系 =====
  {
    id:     'no-armor',
    icon:   '🛡',
    label:  '防具購入禁止',
    desc:   '強チームはアーマー・シールド類の購入禁止。ノーアーマー縛り。',
    target: 'strong',
  },
  {
    id:     'no-buy',
    icon:   '💸',
    label:  '購入禁止（ピストルラウンド縛り）',
    desc:   '強チームは毎ラウンド購入フェーズで何も買えない。初期装備のみ。',
    target: 'strong',
  },

  // ===== アビリティ系 =====
  {
    id:     'no-ability',
    icon:   '🔕',
    label:  '全アビリティ禁止',
    desc:   '強チームはウルト含む全アビリティ使用禁止。射撃と移動のみ。',
    target: 'strong',
  },
  {
    id:     'no-ult',
    icon:   '✨',
    label:  'ウルト禁止',
    desc:   '強チームはアルティメット使用禁止。通常スキルは使用可。',
    target: 'strong',
  },
  {
    id:     'no-signature',
    icon:   '🚷',
    label:  'シグネチャー禁止',
    desc:   '強チームは各エージェントのシグネチャースキル（無料スキル）使用禁止。',
    target: 'strong',
  },

  // ===== 戦術系 =====
  {
    id:     'rush-every-round',
    icon:   '⚡',
    label:  '毎ラウンド突撃',
    desc:   '強チームはラウンド開始後10秒以内にサイトへ突撃しなければならない。',
    target: 'strong',
  },
  {
    id:     'solo-entry',
    icon:   '🚪',
    label:  '1人ずつ入場',
    desc:   '強チームはサイト入場を必ず1人ずつ行う。複数人同時エントリー禁止。',
    target: 'strong',
  },
  {
    id:     'no-camp',
    icon:   '🏃',
    label:  'キャンプ禁止',
    desc:   '強チームは同じ場所に5秒以上留まることを禁止。常に動き続けること。',
    target: 'strong',
  },
  {
    id:     'first-blood-sit',
    icon:   '💀',
    label:  '先制キルしたら離脱',
    desc:   '強チームは最初にキルした1人が即座にそのラウンドを退場する。',
    target: 'strong',
  },

  // ===== コミュニケーション系 =====
  {
    id:     'no-vc',
    icon:   '🔇',
    label:  'VC禁止',
    desc:   '強チームはボイスチャット・テキストチャット全面禁止。アイコンのみでコミュニケーション。',
    target: 'strong',
  },
  {
    id:     'no-minimap',
    icon:   '🗺',
    label:  'ミニマップ禁止',
    desc:   '強チームはミニマップを非表示にしてプレイ。位置情報なしで戦う。',
    target: 'strong',
  },
]

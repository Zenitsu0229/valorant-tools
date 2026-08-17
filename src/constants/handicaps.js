/**
 * ハンデ一覧
 * target:   'strong' = 強チーム(TEAM A)への制約 / 'weak' = 弱チーム(TEAM B)へのボーナス / 'both' = 両チームへの制約
 * strength: ハンデの強さ（1=軽い 〜 5=重い）。チーム分け結果のハンデカードに表示される。
 * 追加する場合はこのファイルにオブジェクトを追記するだけでOK
 */
export const HANDICAPS = [
  // ===== 経済系（設定画面のクレジット項目で即調整可） =====
  {
    id:       'weak-unlimited-credits',
    icon:     '💎',
    label:    'クレジット無限（弱チーム）',
    desc:     '弱チームは毎ラウンド開始時のクレジットを実質無制限にする。カスタム設定画面のクレジット項目で調整可能。',
    target:   'weak',
    strength: 4,
  },
  {
    id:       'strong-credit-cut',
    icon:     '📉',
    label:    '開始クレジット減額',
    desc:     '強チームの開始クレジットを800→400に減額する。カスタム設定画面のクレジット項目で調整可能。',
    target:   'strong',
    strength: 2,
  },
  {
    id:       'no-armor-buy',
    icon:     '🛡',
    label:    'アーマー購入禁止',
    desc:     '強チームはアーマー・シールド類の購入を禁止する（口頭ルール）。',
    target:   'strong',
    strength: 2,
  },
  {
    id:       'ult-only-ability-buy',
    icon:     '💠',
    label:    'ウルト以外購入禁止',
    desc:     '強チームはウルトポイント以外の有償アビリティ購入を禁止する（口頭ルール）。',
    target:   'strong',
    strength: 3,
  },

  // ===== 武器縛り系（口頭ルールのみで成立） =====
  {
    id:       'pistol-only',
    icon:     '🔫',
    label:    'ピストルのみ',
    desc:     '強チームはピストル（クラシック / ショーティ / フレンジー / ゴースト / シェリフ）のみ購入可（口頭ルールのみで成立）。',
    target:   'strong',
    strength: 5,
  },
  {
    id:       'no-rifle-smg-ok',
    icon:     '🚫',
    label:    'ライフル禁止',
    desc:     '強チームはライフル禁止。SMG・ショットガンまでは購入可（口頭ルールのみで成立）。',
    target:   'strong',
    strength: 4,
  },
  {
    id:       'no-operator',
    icon:     '🎯',
    label:    'オペレーター禁止',
    desc:     '強チームはオペレーター（スナイパーライフル）の購入を禁止する（口頭ルールのみで成立）。',
    target:   'strong',
    strength: 2,
  },

  // ===== アビリティ・エージェント系（口頭ルール） =====
  {
    id:       'no-ability-all',
    icon:     '🔕',
    label:    'アビリティ全面禁止',
    desc:     '強チームはウルト含む全アビリティ使用禁止（口頭ルール）。',
    target:   'strong',
    strength: 5,
  },
  {
    id:       'no-ult',
    icon:     '✨',
    label:    'ウルト禁止',
    desc:     '強チームはアルティメット使用禁止。通常スキルは使用可（口頭ルール）。',
    target:   'strong',
    strength: 3,
  },
  {
    id:       'no-duelist',
    icon:     '⚔',
    label:    'デュエリスト禁止',
    desc:     '強チームはデュエリストロールのエージェント選択を禁止する（口頭ルール）。',
    target:   'strong',
    strength: 2,
  },

  // ===== スコア・ラウンド系（開始前に取り決め） =====
  {
    id:       'behind-start-0-3',
    icon:     '📊',
    label:    '0-3ビハインドスタート',
    desc:     '強チームは試合開始時点で0-3のビハインドから始める（事前取り決め）。',
    target:   'strong',
    strength: 3,
  },
  {
    id:       'weak-plus-2-rounds',
    icon:     '➕',
    label:    '弱チーム+2ラウンド',
    desc:     '弱チームは試合開始時点で+2ラウンドを先取した状態から始める（事前取り決め）。',
    target:   'weak',
    strength: 2,
  },
  {
    id:       'win-condition-15',
    icon:     '🏁',
    label:    '勝利条件15ラウンド',
    desc:     '強チームの勝利条件を15ラウンド先取に引き上げる。弱チームは通常通りの先取本数で勝利（事前取り決め）。',
    target:   'strong',
    strength: 4,
  },

  // ===== 人数系（ロビーで人数調整するだけ） =====
  {
    id:       'four-vs-five',
    icon:     '👥',
    label:    '4人 vs 5人',
    desc:     '強チームは4人、弱チームは5人でプレイする。ロビーの人数を調整するだけで成立。',
    target:   'strong',
    strength: 5,
  },

  // ===== HP削り系（通常アビリティで再現、チート設定不要） =====
  {
    id:       'self-molly-start',
    icon:     '🔥',
    label:    '自傷スタート',
    desc:     '強チームは試合開始時に味方のモロトフ等でHPを削ってからラウンドを開始する（通常アビリティで再現、チート設定不要）。',
    target:   'strong',
    strength: 3,
  },

  // ===== 情報・視覚系（各自の設定/口頭ルール） =====
  {
    id:       'no-vc',
    icon:     '🔇',
    label:    'VC禁止',
    desc:     '強チームはボイスチャット・テキストチャット全面禁止（各自の設定/口頭ルール）。',
    target:   'strong',
    strength: 3,
  },
  {
    id:       'no-minimap',
    icon:     '🗺',
    label:    'ミニマップ非表示',
    desc:     '強チームはミニマップを非表示にしてプレイする（各自の設定/口頭ルール）。',
    target:   'strong',
    strength: 3,
  },
]

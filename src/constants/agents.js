// Valorant API の画像ベース URL
const BASE = 'https://media.valorant-api.com/agents'

/**
 * 全エージェント定義（2026年3月時点 / 25体）
 * @type {{ name: string, role: string, icon: string, portrait: string }[]}
 *
 * - name:     日本語表記のエージェント名
 * - role:     ロールキー（'duelist' | 'initiator' | 'controller' | 'sentinel'）
 * - icon:     ロールピック画面などで使う小アイコン画像 URL
 * - portrait: 結果カードで使うフルポートレート画像 URL
 *
 * 新エージェントを追加する場合はこのファイルに追記するだけで全ページに反映される。
 */
export const AGENTS = [
  // ── デュエリスト（8体）─────────────────────────────
  {
    name: 'ジェット', role: 'duelist',
    icon:     `${BASE}/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png`,
    portrait: `${BASE}/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png`,
  },
  {
    name: 'フェニックス', role: 'duelist',
    icon:     `${BASE}/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png`,
    portrait: `${BASE}/eb93336a-449b-9c1b-0a54-a891f7921d69/fullportrait.png`,
  },
  {
    name: 'レイズ', role: 'duelist',
    icon:     `${BASE}/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png`,
    portrait: `${BASE}/f94c3b30-42be-e959-889c-5aa313dba261/fullportrait.png`,
  },
  {
    name: 'レイナ', role: 'duelist',
    icon:     `${BASE}/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png`,
    portrait: `${BASE}/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/fullportrait.png`,
  },
  {
    name: 'ネオン', role: 'duelist',
    icon:     `${BASE}/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png`,
    portrait: `${BASE}/bb2a4828-46eb-8cd1-e765-15848195d751/fullportrait.png`,
  },
  {
    name: 'ヨル', role: 'duelist',
    icon:     `${BASE}/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png`,
    portrait: `${BASE}/7f94d92c-4234-0a36-9646-3a87eb8b5c89/fullportrait.png`,
  },
  {
    name: 'アイソ', role: 'duelist',
    icon:     `${BASE}/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png`,
    portrait: `${BASE}/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/fullportrait.png`,
  },
  {
    name: 'ウェイレイ', role: 'duelist',
    icon:     `${BASE}/df1cb487-4902-002e-5c17-d28e83e78588/displayicon.png`,
    portrait: `${BASE}/df1cb487-4902-002e-5c17-d28e83e78588/fullportrait.png`,
  },
  // ── イニシエーター（6体）──────────────────────────
  {
    name: 'ソーヴァ', role: 'initiator',
    icon:     `${BASE}/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png`,
    portrait: `${BASE}/320b2a48-4d9b-a075-30f1-1f93a9b638fa/fullportrait.png`,
  },
  {
    name: 'ブリーチ', role: 'initiator',
    icon:     `${BASE}/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png`,
    portrait: `${BASE}/5f8d3a7f-467b-97f3-062c-13acf203c006/fullportrait.png`,
  },
  {
    name: 'スカイ', role: 'initiator',
    icon:     `${BASE}/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png`,
    portrait: `${BASE}/6f2a04ca-43e0-be17-7f36-b3908627744d/fullportrait.png`,
  },
  {
    name: 'フェイド', role: 'initiator',
    icon:     `${BASE}/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png`,
    portrait: `${BASE}/dade69b4-4f5a-8528-247b-219e5a1facd6/fullportrait.png`,
  },
  {
    name: 'ゲッコー', role: 'initiator',
    icon:     `${BASE}/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png`,
    portrait: `${BASE}/e370fa57-4757-3604-3648-499e1f642d3f/fullportrait.png`,
  },
  {
    name: 'KAY/O', role: 'initiator',
    icon:     `${BASE}/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png`,
    portrait: `${BASE}/601dbbe7-43ce-be57-2a40-4abd24953621/fullportrait.png`,
  },
  // ── コントローラー（6体）──────────────────────────
  {
    name: 'ブリムストーン', role: 'controller',
    icon:     `${BASE}/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png`,
    portrait: `${BASE}/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/fullportrait.png`,
  },
  {
    name: 'ヴァイパー', role: 'controller',
    icon:     `${BASE}/707eab51-4836-f488-046a-cda6bf494859/displayicon.png`,
    portrait: `${BASE}/707eab51-4836-f488-046a-cda6bf494859/fullportrait.png`,
  },
  {
    name: 'オーメン', role: 'controller',
    icon:     `${BASE}/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png`,
    portrait: `${BASE}/8e253930-4c05-31dd-1b6c-968525494517/fullportrait.png`,
  },
  {
    name: 'アストラ', role: 'controller',
    icon:     `${BASE}/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png`,
    portrait: `${BASE}/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/fullportrait.png`,
  },
  {
    name: 'ハーバー', role: 'controller',
    icon:     `${BASE}/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png`,
    portrait: `${BASE}/95b78ed7-4637-86d9-7e41-71ba8c293152/fullportrait.png`,
  },
  {
    name: 'クローヴ', role: 'controller',
    icon:     `${BASE}/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png`,
    portrait: `${BASE}/1dbf2edd-4729-0984-3115-daa5eed44993/fullportrait.png`,
  },
  // ── センチネル（6体）──────────────────────────────
  {
    name: 'キルジョイ', role: 'sentinel',
    icon:     `${BASE}/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png`,
    portrait: `${BASE}/1e58de9c-4950-5125-93e9-a0aee9f98746/fullportrait.png`,
  },
  {
    name: 'セージ', role: 'sentinel',
    icon:     `${BASE}/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png`,
    portrait: `${BASE}/569fdd95-4d10-43ab-ca70-79becc718b46/fullportrait.png`,
  },
  {
    name: 'サイファー', role: 'sentinel',
    icon:     `${BASE}/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png`,
    portrait: `${BASE}/117ed9e3-49f3-6512-3ccf-0cada7e3823b/fullportrait.png`,
  },
  {
    name: 'チェンバー', role: 'sentinel',
    icon:     `${BASE}/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png`,
    portrait: `${BASE}/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/fullportrait.png`,
  },
  {
    name: 'デッドロック', role: 'sentinel',
    icon:     `${BASE}/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png`,
    portrait: `${BASE}/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/fullportrait.png`,
  },
  {
    name: 'ヴァイン', role: 'sentinel',
    icon:     `${BASE}/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png`,
    portrait: `${BASE}/efba5359-4016-a1e5-7626-b1ae76895940/fullportrait.png`,
  },
]

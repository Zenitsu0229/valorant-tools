import { createRouter, createWebHistory } from 'vue-router'

const BASE_URL = 'https://valorant-tools-two.vercel.app'

export const TAB_ROUTES = [
  {
    path: '/agent-roulette',
    tab: 'agent5',
    meta: {
      tab: 'agent5',
      title:       'VALORANTエージェント ランダムピック【無料・バン機能付き】',
      description: 'VALORANTのエージェントをランダムで割り振れる無料ツール。バン機能・ロール指定（デュエリスト/イニシエーター等）・5人同時対応。縛りプレイ・トロールルーレットに最適。スマホ対応。',
      ogTitle:     'VALORANT Random Agent Picker | Free – Ban Phase & Role Filter',
      ogDesc:      'Randomly pick VALORANT agents with ban phase and role filter. Up to 5 players. Free VALORANT agent randomizer — no login needed.',
    },
  },
  {
    path: '/map-roulette',
    tab: 'map',
    meta: {
      tab: 'map',
      title:       'VALORANTマップ ルーレット | ランダム選択ツール【無料】',
      description: 'VALORANTのマップをルーレットでランダム選択できる無料ツール。コンペティティブマップのみ絞り込み・除外設定に対応。スクリム・カスタムゲームのマップ決めに最適。スマホ対応。',
      ogTitle:     'VALORANT Map Roulette | Free Random Map Picker',
      ogDesc:      'Randomly pick a VALORANT map with a roulette. Exclude maps, competitive-only preset. Free VALORANT map randomizer for scrims and custom games.',
    },
  },
  {
    path: '/custom',
    tab: 'agent5v5',
    meta: {
      tab: 'agent5v5',
      title:       'VALORANT 5v5カスタム エージェントランダム決め【無料ツール】',
      description: 'VALORANTの5v5カスタムゲームでエージェントをランダム割り振りできる無料ツール。TEAM A・TEAM B各5人に対応。スクリム・内輪カスタムのキャラ決めに最適。',
      ogTitle:     'VALORANT 5v5 Custom Game Agent Randomizer | Free',
      ogDesc:      'Randomly assign VALORANT agents to TEAM A and TEAM B for 5v5 custom games. Per-team ban phase and role filter. Free — no login needed.',
    },
  },
  {
    path: '/team',
    tab: 'teamsplit',
    meta: {
      tab: 'teamsplit',
      title:       'VALORANTチーム分け ランダムツール【2〜10人対応・無料】',
      description: '2〜10人をランダムにチーム分けできるVALORANT専用ツール。バランス/ランダム/ハンデ分けに対応。フルパ・カスタムゲームのチーム決めに最適。無料・スマホ対応。',
      ogTitle:     'VALORANT Random Team Split | Free Team Randomizer',
      ogDesc:      'Randomly split 2–10 VALORANT players into teams. Balanced, random, and handicap modes. Free VALORANT team randomizer.',
    },
  },
  {
    path: '/contact',
    tab: 'contact',
    meta: {
      tab: 'contact',
      title:       'Contact | VAL RANDOM – VALORANT Randomizer',
      description: 'Contact VAL RANDOM for bug reports, feature requests, or feedback. ／VAL RANDOMへのお問い合わせ。バグ報告・機能リクエスト・ご意見をお待ちしています。',
      ogTitle:     'Contact | VAL RANDOM',
      ogDesc:      'Contact VAL RANDOM for bug reports, feature requests, or any feedback.',
    },
  },
]

const routes = [
  { path: '/', redirect: '/agent-roulette' },
  ...TAB_ROUTES.map(({ path, meta }) => ({ path, meta })),
]

export { BASE_URL }
export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

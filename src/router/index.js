import { createRouter, createWebHistory } from 'vue-router'

export const BASE_URL = 'https://valorant-tools-two.vercel.app'

// ページごとの SEO 設定（title / canonical / description / OGP）
export const PAGE_META = {
  '/home': {
    title:       'VAL RANDOM 使い方・更新履歴 | VALORANTツールまとめ',
    canonical:   `${BASE_URL}/home`,
    description: 'VAL RANDOMの使い方ガイドと更新履歴。エージェントランダムピック・5v5カスタム・マップルーレット・チーム分けツールの一覧と各ツールの使い方をまとめて紹介。',
    ogTitle:     'VAL RANDOM – Home | Usage Guide & Changelog',
    ogDesc:      'Overview and usage guide for all VAL RANDOM tools: agent picker, 5v5 custom, map roulette, and team split — plus release notes.',
  },
  '/': {
    title:       'VALORANTランダムピック・キャラルーレット【無料・バン機能付き】| VAL RANDOM',
    canonical:   `${BASE_URL}/`,
    description: 'VALORANTのキャラ（エージェント）をランダムピック・ルーレットできる無料ツール。バン機能・ロール指定・5v5対応。縛りプレイ・トロールルーレットに最適。スマホ対応。',
    ogTitle:     'VALORANT Random Agent & Map Picker | Free Roulette Tool',
    ogDesc:      'Free VALORANT random agent picker and map roulette. Ban phase, role filter, 5v5 custom game support. No login needed.',
  },
  '/agent-roulette': {
    title:       'VALORANTエージェント ランダムピック | バン・ロール指定対応【無料】| VAL RANDOM',
    canonical:   `${BASE_URL}/agent-roulette`,
    description: 'VALORANTのエージェントをランダムで割り振れる無料ツール。バン機能・ロール指定（デュエリスト/イニシエーター等）・5人同時対応。縛りプレイ・トロールルーレットに最適。スマホ対応。',
    ogTitle:     'VALORANT Random Agent Picker | Free – Ban Phase & Role Filter',
    ogDesc:      'Randomly pick VALORANT agents with ban phase and role filter. Up to 5 players. Free VALORANT agent randomizer — no login needed.',
  },
  '/map-roulette': {
    title:       'VALORANTマップ ルーレット | ランダム選択ツール【無料】| VAL RANDOM',
    canonical:   `${BASE_URL}/map-roulette`,
    description: 'VALORANTのマップをルーレットでランダム選択できる無料ツール。コンペティティブマップのみ絞り込み・除外設定・BO3モード対応。スクリム・カスタムゲームのマップ決めに最適。',
    ogTitle:     'VALORANT Map Roulette | Free Random Map Picker',
    ogDesc:      'Randomly pick a VALORANT map with a roulette. Exclude maps, competitive-only preset, BO3 mode. Free VALORANT map randomizer.',
  },
  '/custom': {
    title:       'VALORANT 5v5カスタム エージェントランダム決め【無料ツール】| VAL RANDOM',
    canonical:   `${BASE_URL}/custom`,
    description: 'VALORANTの5v5カスタムゲームでエージェントをランダム割り振りできる無料ツール。TEAM A・TEAM B各5人に対応。スクリム・内輪カスタムのキャラ決めに最適。',
    ogTitle:     'VALORANT 5v5 Custom Game Agent Randomizer | Free',
    ogDesc:      'Randomly assign VALORANT agents to TEAM A and TEAM B for 5v5 custom games. Per-team ban phase and role filter. Free — no login needed.',
  },
  '/team': {
    title:       'VALORANTチーム分けツール【2〜10人対応・無料】| VAL RANDOM',
    canonical:   `${BASE_URL}/team`,
    description: '2〜10人をランダムにチーム分けできるVALORANT専用ツール。バランス/ランダム/ハンデ分けに対応。フルパ・カスタムゲームのチーム決めに最適。無料・スマホ対応。',
    ogTitle:     'VALORANT Random Team Split | Free Team Randomizer',
    ogDesc:      'Randomly split 2–10 VALORANT players into teams. Balanced, random, and handicap modes. Free VALORANT team randomizer.',
  },
  '/contact': {
    title:       'お問い合わせ | VAL RANDOM',
    canonical:   `${BASE_URL}/contact`,
    description: 'VAL RANDOMへのバグ報告・機能リクエスト・その他ご意見はこちらからどうぞ。',
    ogTitle:     'Contact | VAL RANDOM',
    ogDesc:      'Contact VAL RANDOM for bug reports, feature requests, or any feedback.',
  },
}

// TAB_ROUTES: App.vue のタブ切り替えと pathForTab() が参照する
export const TAB_ROUTES = [
  { path: '/home',           tab: 'home'      },
  { path: '/agent-roulette', tab: 'agent5'    },
  { path: '/map-roulette',   tab: 'map'       },
  { path: '/custom',         tab: 'agent5v5'  },
  { path: '/team',           tab: 'teamsplit' },
  { path: '/contact',        tab: 'contact'   },
]

// 各タブは App.vue 側で v-show により切り替えており、<router-view> は使わないため
// ダミーの no-op コンポーネントを割り当てる。
// component を持たないルートレコードは Vue Router のマッチャーに登録されず
// （route.meta が常に空になり、直接URLアクセス時に誤ったタブが表示される・
//  ブラウザの戻る/進むでタブが同期しなくなる）ため、これは省略できない。
const NOOP_COMPONENT = { render: () => null }

const routes = [
  { path: '/', redirect: '/agent-roulette' },
  ...TAB_ROUTES.map(({ path, tab }) => ({ path, component: NOOP_COMPONENT, meta: { tab } })),
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

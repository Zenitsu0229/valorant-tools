<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import './Home.css'
import { AGENTS } from '@/constants/agents.js'

// ツールカードのクリックで App.vue へタブ遷移を通知
const emit = defineEmits(['navigate'])

// ツール一覧グリッドの元データ（key は App.vue の tabs / TAB_ROUTES と一致させる）
// accent: global.css の .agent-role--* パレットに合わせたカードごとのアクセントカラー
const TOOLS = [
  {
    key:    'agent5',
    icon:   '🎯',
    title:  'Random（エージェントランダムピック）',
    desc:   'VALORANTのエージェント（キャラ）をルーレットでランダムピック。バン機能でキャラを除外・ロール指定で絞り込み可能。1〜5人対応。',
    accent: 'duelist',
  },
  {
    key:    'agent5v5',
    icon:   '⚔️',
    title:  'Custom（5v5カスタム）',
    desc:   '5v5カスタムゲーム向けにTEAM A・TEAM B各5人のエージェントをランダム割り振り。チームごとにバンフェーズ・ロール指定が独立して設定可能。',
    accent: 'controller',
  },
  {
    key:    'map',
    icon:   '🗺️',
    title:  'Map（マップルーレット）',
    desc:   'VALORANTのマップをルーレットでランダム選択。コンペティティブマップのみ絞り込み・除外マップ指定・BO3対応。',
    accent: 'initiator',
  },
  {
    key:    'teamsplit',
    icon:   '🧩',
    title:  'Team（チーム分け）',
    desc:   '2〜10人のプレイヤーをランダムにチーム分け。バランス／ランダム／ハンデモードに対応。8段階ランクとカスタムハンデ（強さ1〜5段階）にも対応。',
    accent: 'sentinel',
  },
]

// 使い方（4ステップフロー）
const STEPS = [
  { n: 1, title: 'ツールを選ぶ',       desc: '上のカードまたはナビタブからやりたいことを選択' },
  { n: 2, title: 'プレイヤー情報を入力', desc: '名前・人数・バンやロールなど任意条件を設定' },
  { n: 3, title: '抽選を実行',         desc: 'ボタン1つでルーレット演出とともに結果を決定' },
  { n: 4, title: '結果を確認・共有',   desc: '結果をそのままスクショ、Xやチームに共有' },
]

// 更新履歴（git履歴を元に編集した実データ、新しい順）
const CHANGELOG = [
  { date: '2026/08', text: 'ランク8段階化（アイアン〜レディアント）とポイント制度・ハンデ設定（強さ1〜5段階）を刷新（チーム分けツール）' },
  { date: '2026/07', text: 'ゲームアップデート対応（最新パッチのエージェント／マップを反映）' },
  { date: '2026/05', text: 'コンペティティブマップローテーション更新、Patch 12.08対応' },
  { date: '2026/03', text: 'チーム分けツール公開（バランス／ランダム／ハンデモード、一括入力、BO3モード追加）' },
  { date: '2026/03', text: 'お問い合わせフォーム（メール送信）を追加' },
  { date: '2026/03', text: 'サイト公開（初回リリース：エージェント／マップ ランダムピック、5v5カスタム対応）' },
]

// ヒーローの value プロップ（インパクト用の数字）
const STATS = [
  { n: `${AGENTS.length}`, label: 'AGENTS' },
  { n: '11',                label: 'MAPS' },
  { n: '100%',              label: 'FREE' },
  { n: '0',                 label: 'LOGIN' },
]

function goTo(key) {
  emit('navigate', key)
}

// ===== マーキー（ロール別に少数精鋭で並べる。全27体だと帯が単調に長くなるため間引く） =====
const marqueeAgents = [...AGENTS, ...AGENTS] // シームレスループのため複製

// ===== モーション演出 =====
const reduceMotion  = ref(false)
const showHeroVideo = ref(false)
const videoReady    = ref(false)
const heroRef        = ref(null)
const homeRoot       = ref(null)

// ヒーローのマウス追従パララックス（背景・フローターアイコンをわずかに動かす）
function onHeroMouseMove(e) {
  if (reduceMotion.value || !heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  heroRef.value.style.setProperty('--mx', x.toFixed(3))
  heroRef.value.style.setProperty('--my', y.toFixed(3))
}
function onHeroMouseLeave() {
  heroRef.value?.style.setProperty('--mx', 0)
  heroRef.value?.style.setProperty('--my', 0)
}

// ツールカードの3Dチルト＋スポットライト演出（マウス位置に応じてCSS変数を更新するだけの軽量実装）
function onCardMouseMove(e) {
  if (reduceMotion.value) return
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width
  const py = (e.clientY - rect.top) / rect.height
  card.style.setProperty('--rx', ((0.5 - py) * 10).toFixed(2) + 'deg')
  card.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg')
  card.style.setProperty('--gx', (px * 100).toFixed(1) + '%')
  card.style.setProperty('--gy', (py * 100).toFixed(1) + '%')
}
function onCardMouseLeave(e) {
  const card = e.currentTarget
  card.style.setProperty('--rx', '0deg')
  card.style.setProperty('--ry', '0deg')
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let observer
onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isNarrow = window.matchMedia('(max-width: 720px)').matches
  showHeroVideo.value = !reduceMotion.value && !isNarrow

  // スクロールで画面に入ったセクションに .is-visible を付与するだけの軽量 IntersectionObserver
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.15 })

  homeRoot.value?.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="home" ref="homeRoot">

    <!-- ヒーローセクション -->
    <section
      class="home-hero"
      ref="heroRef"
      @mousemove="onHeroMouseMove"
      @mouseleave="onHeroMouseLeave"
    >
      <div class="home-hero__media">
        <img
          class="home-hero__poster"
          src="/home/hero-poster.jpg"
          alt=""
          fetchpriority="high"
        />
        <video
          v-if="showHeroVideo"
          class="home-hero__video"
          :class="{ 'is-ready': videoReady }"
          autoplay muted loop playsinline preload="auto"
          @canplay="videoReady = true"
        >
          <source src="/home/hero-bg.mp4" type="video/mp4" />
        </video>
        <div class="home-hero__grid"></div>
        <div class="home-hero__scanline"></div>
        <div class="home-hero__vignette"></div>
      </div>

      <div class="home-hero__floaters" aria-hidden="true">
        <span
          v-for="(a, i) in [AGENTS[0], AGENTS[9], AGENTS[16], AGENTS[22], AGENTS[3], AGENTS[12]]"
          :key="i"
          class="home-hero__floater-wrap"
          :class="`home-hero__floater-wrap--${i}`"
        >
          <img :src="a.icon" class="home-hero__floater" :class="`agent-role--${a.role}`" />
        </span>
      </div>

      <div class="home-hero__content">
        <p class="home-hero__kicker">
          <span class="home-hero__dot"></span>
          WELCOME TO VAL<span>//</span>RANDOM
        </p>
        <h1 class="home-hero__title">
          <span class="home-hero__glitch" data-text="VAL//RANDOM">VAL<span class="home-hero__slash">//</span>RANDOM</span>
          <span class="home-hero__title-sub">へようこそ</span>
        </h1>
        <p class="home-hero__lead">
          VALORANTのエージェント・マップ・チーム分けを、すべて無料でランダム決定。
          フルパの縛りプレイからカスタムゲームの準備まで、面倒な「決め」をワンクリックで。
        </p>

        <div class="home-hero__cta">
          <button class="home-hero__btn-primary" @click="scrollToId('tools')">
            今すぐツールを使う
          </button>
          <button class="home-hero__btn-ghost" @click="scrollToId('steps')">
            使い方を見る
          </button>
        </div>

        <div class="home-hero__stats">
          <div v-for="s in STATS" :key="s.label" class="home-hero__stat">
            <span class="home-hero__stat-num">{{ s.n }}</span>
            <span class="home-hero__stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <button class="home-hero__scrollcue" @click="scrollToId('tools')" aria-label="次のセクションへスクロール">
        <span class="home-hero__scrollcue-line"></span>
        SCROLL
      </button>
    </section>

    <!-- エージェント・マーキー（常時流れるダイナミックなティッカー） -->
    <section class="home-marquee" aria-hidden="true">
      <div class="home-marquee__fade home-marquee__fade--l"></div>
      <div class="home-marquee__fade home-marquee__fade--r"></div>
      <div class="home-marquee__track">
        <span
          v-for="(a, i) in marqueeAgents"
          :key="i"
          class="home-marquee__item"
          :class="`agent-role--${a.role}`"
        >
          <img :src="a.icon" class="home-marquee__icon" />
          {{ a.name }}
        </span>
      </div>
    </section>

    <!-- ツール一覧グリッド -->
    <section class="home-tools reveal" id="tools">
      <h2 class="section-title">ツール一覧</h2>
      <p class="section-desc">気になるツールをタップすると、そのままそのページへ移動します。</p>
      <div class="home-tools__grid">
        <button
          v-for="(t, i) in TOOLS" :key="t.key"
          class="tool-card"
          :class="`tool-card--${t.accent}`"
          :style="{ '--delay': `${i * 0.09}s` }"
          @mousemove="onCardMouseMove"
          @mouseleave="onCardMouseLeave"
          @click="goTo(t.key)"
        >
          <span class="tool-card__spotlight"></span>
          <span class="tool-card__index">0{{ i + 1 }}</span>
          <span class="tool-card__icon">{{ t.icon }}</span>
          <span class="tool-card__title">{{ t.title }}</span>
          <span class="tool-card__desc">{{ t.desc }}</span>
          <span class="tool-card__cta">使ってみる →</span>
        </button>
      </div>
    </section>

    <!-- 使い方（4ステップ） -->
    <section class="home-steps reveal" id="steps">
      <h2 class="section-title">使い方</h2>
      <p class="section-desc">どのツールも、この4ステップで完結します。</p>
      <ol class="home-steps__flow">
        <li v-for="(s, i) in STEPS" :key="s.n" class="home-step" :style="{ '--delay': `${i * 0.15}s` }">
          <span class="home-step__num">{{ s.n }}</span>
          <span class="home-step__title">{{ s.title }}</span>
          <span class="home-step__desc">{{ s.desc }}</span>
        </li>
      </ol>
    </section>

    <!-- 更新履歴タイムライン -->
    <section class="home-changelog reveal">
      <h2 class="section-title">更新履歴</h2>
      <p class="section-desc">サイトの主要なアップデートをまとめています。</p>
      <ul class="home-timeline">
        <li
          v-for="(c, i) in CHANGELOG" :key="i" class="home-timeline__item"
          :style="{ '--delay': `${i * 0.06}s` }"
        >
          <span class="home-timeline__date">{{ c.date }}</span>
          <span class="home-timeline__dot"></span>
          <span class="home-timeline__text">{{ c.text }}</span>
        </li>
      </ul>
    </section>

    <!-- 締めのCTA -->
    <section class="home-final-cta reveal">
      <img src="/home/cta-banner.jpg" alt="" class="home-final-cta__bg" loading="lazy" />
      <div class="home-final-cta__overlay"></div>
      <div class="home-final-cta__content">
        <p class="home-hero__kicker home-final-cta__kicker">
          <span class="home-hero__dot"></span>
          READY?
        </p>
        <h2 class="home-final-cta__title">今すぐ「決め」を終わらせよう</h2>
        <p class="home-final-cta__lead">迷う時間はゼロに。エージェント・マップ・チーム分け、すべてワンクリックで。</p>
        <div class="home-hero__cta">
          <button class="home-hero__btn-primary" @click="goTo('agent5')">Randomを試す</button>
          <button class="home-hero__btn-ghost" @click="goTo('teamsplit')">Teamを試す</button>
        </div>
      </div>
    </section>

    <!-- 免責事項（サイト共通の表記を流用） -->
    <p class="seo-section__disclaimer">
      このサイトはRiot Gamesの公認・承認を受けたものではありません。VALORANTはRiot Games, Inc.の登録商標です。
      ヒーロー背景のアートワークはAI生成のイメージビジュアルです。
    </p>

  </div>
</template>

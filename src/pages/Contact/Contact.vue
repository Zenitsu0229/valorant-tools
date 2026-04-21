<script setup>
// Vue の ref をインポート（リアクティブな変数を作るために使う）
import { ref } from 'vue'
// EmailJS ライブラリをインポート（フォームの内容をメールで送信するために使う）
import emailjs from '@emailjs/browser'
// このページ専用のスタイルを適用
import './Contact.css'

// EmailJS の設定値（サービスID・テンプレートID・公開キー）
const EMAILJS_SERVICE  = 'valorantToolsSuport'
const EMAILJS_TEMPLATE = 'template_droxhiq'
const EMAILJS_KEY      = '19eKLO4vnSkZSZ3eT'

// フォームの入力値をまとめて管理するリアクティブオブジェクト
// ref() で包むことで、値が変わると画面が自動的に更新される
const form = ref({
  name: '',
  email: '',
  category: '',
  message: '',
})

// カテゴリの選択肢（key: 内部値, label: 画面表示名）
const categories = [
  { key: 'bug',     label: 'バグ報告' },
  { key: 'feature', label: '機能リクエスト' },
  { key: 'other',   label: 'その他' },
]

// 現在の画面ステップを管理するリアクティブ変数
// 'form'（入力中）→ 'confirm'（確認中）→ 'sending'（送信中）→ 'done'（完了）or 'error'（エラー）
const step     = ref('form')
// バリデーションエラーのメッセージを項目ごとに格納するオブジェクト
const errors   = ref({})
// 送信失敗時のエラーメッセージ
const sendError = ref('')

// ---- バリデーション（入力チェック） ----
function validate() {
  const e = {}
  // 名前が空の場合はエラーをセット
  if (!form.value.name.trim())    e.name     = '名前を入力してください'
  // メールが空の場合はエラーをセット
  if (!form.value.email.trim())   e.email    = 'メールアドレスを入力してください'
  // メール形式が正しくない場合もエラーをセット（正規表現でチェック）
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))
                                  e.email    = '正しいメールアドレスを入力してください'
  // カテゴリが未選択の場合はエラーをセット
  if (!form.value.category)       e.category = 'カテゴリを選択してください'
  // メッセージが空の場合はエラーをセット
  if (!form.value.message.trim()) e.message  = 'メッセージを入力してください'
  // エラーオブジェクトを反映
  errors.value = e
  // エラーが0件なら true（バリデーション成功）、1件以上なら false を返す
  return Object.keys(e).length === 0
}

// ---- 確認画面へ進む ----
function goConfirm() {
  // バリデーション失敗なら処理を中断（確認画面へ進まない）
  if (!validate()) return
  step.value = 'confirm'
}

// ---- メール送信処理（非同期） ----
async function send() {
  // 送信中ステップへ切り替え（ボタンを無効化してダブル送信を防止）
  step.value  = 'sending'
  sendError.value = ''
  try {
    // EmailJS を使ってメールを送信
    // テンプレート変数にフォームの値をマッピング
    await emailjs.send(
      EMAILJS_SERVICE,
      EMAILJS_TEMPLATE,
      {
        from_name:  form.value.name,
        from_email: form.value.email,
        category:   categoryLabel(form.value.category), // key → 表示名に変換
        message:    form.value.message,
      },
      EMAILJS_KEY
    )
    // 送信成功 → 完了ステップへ
    step.value = 'done'
  } catch (err) {
    // 送信失敗 → エラーメッセージをセットして確認画面に戻る
    sendError.value = `送信に失敗しました（${err?.text ?? err}）。時間をおいて再度お試しください。`
    step.value = 'confirm'
  }
}

// ---- フォームをリセット（最初の状態に戻す） ----
function reset() {
  form.value = { name: '', email: '', category: '', message: '' }
  errors.value = {}
  sendError.value = ''
  step.value = 'form'
}

// ---- カテゴリのキーから表示ラベルを取得するヘルパー関数 ----
// 例: 'bug' → 'バグ報告'
function categoryLabel(key) {
  return categories.find(c => c.key === key)?.label ?? key
}
</script>

<template>
  <div class="contact-page">

    <!-- 送信完了画面 -->
    <div v-if="step === 'done'" class="contact-done">
      <div class="contact-done__icon">✓</div>
      <div class="contact-done__title">お問い合わせありがとうございます</div>
      <div class="contact-done__desc">内容を受け付けました。確認次第ご連絡いたします。</div>
      <!-- 「戻る」ボタンでフォームをリセットして入力画面に戻る -->
      <button class="btn-primary contact-done__btn" @click="reset">戻る</button>
    </div>

    <!-- 確認画面（送信中も同じテンプレートを使用） -->
    <template v-else-if="step === 'confirm' || step === 'sending'">
      <div class="section-title">CONFIRM</div>
      <div class="section-desc">以下の内容でお問い合わせを送信します。ご確認ください。</div>

      <!-- 入力内容の確認リスト -->
      <div class="card contact-confirm">
        <dl class="confirm-list">
          <div class="confirm-row">
            <dt class="confirm-label">名前</dt>
            <dd class="confirm-value">{{ form.name }}</dd>
          </div>
          <div class="confirm-row">
            <dt class="confirm-label">メールアドレス</dt>
            <dd class="confirm-value">{{ form.email }}</dd>
          </div>
          <div class="confirm-row">
            <dt class="confirm-label">カテゴリ</dt>
            <!-- categoryLabel() でキーを日本語ラベルに変換して表示 -->
            <dd class="confirm-value">{{ categoryLabel(form.category) }}</dd>
          </div>
          <div class="confirm-row confirm-row--message">
            <dt class="confirm-label">メッセージ</dt>
            <dd class="confirm-value confirm-value--message">{{ form.message }}</dd>
          </div>
        </dl>
      </div>

      <!-- 送信失敗時のエラーメッセージ（sendError に値がある場合のみ表示） -->
      <div v-if="sendError" class="notice" style="margin-top:16px">{{ sendError }}</div>

      <div class="confirm-actions">
        <!-- 送信中はボタンを無効化して操作を防止 -->
        <button class="btn-secondary" :disabled="step === 'sending'" @click="step = 'form'">修正する</button>
        <button class="btn-primary confirm-actions__send" :disabled="step === 'sending'" @click="send">
          <!-- step が 'sending' の間はボタンテキストを「送信中...」に切り替え -->
          {{ step === 'sending' ? '送信中...' : '送信する' }}
        </button>
      </div>
    </template>

    <!-- 入力フォーム（step === 'form' のとき表示） -->
    <template v-else>
      <div class="section-title">CONTACT</div>
      <div class="section-desc">バグ報告・機能リクエスト・その他ご意見はこちらからどうぞ</div>

      <div class="card">
        <!-- @submit.prevent でデフォルトのページリロードを防ぎ、goConfirm() を呼ぶ -->
        <form class="contact-form" @submit.prevent="goConfirm" novalidate>

          <!-- 名前フィールド -->
          <div class="form-group">
            <label class="input-label" for="contact-name">名前</label>
            <input
              id="contact-name"
              v-model="form.name"
              class="player-row__input"
              :class="{ 'input--error': errors.name }"
              type="text"
              placeholder="お名前を入力"
              autocomplete="name"
            />
            <!-- エラーがある場合のみエラーメッセージを表示 -->
            <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
          </div>

          <!-- メールアドレスフィールド -->
          <div class="form-group">
            <label class="input-label" for="contact-email">メールアドレス</label>
            <input
              id="contact-email"
              v-model="form.email"
              class="player-row__input"
              :class="{ 'input--error': errors.email }"
              type="email"
              placeholder="example@mail.com"
              autocomplete="email"
            />
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <!-- カテゴリ選択（チップボタン） -->
          <div class="form-group">
            <div class="input-label">カテゴリ</div>
            <div class="category-row">
              <!-- categories 配列をループしてボタンを生成 -->
              <button
                v-for="cat in categories"
                :key="cat.key"
                type="button"
                class="filter-chip"
                :class="{ 'filter-chip--active': form.category === cat.key }"
                @click="form.category = cat.key; delete errors.category"
              >{{ cat.label }}</button>
            </div>
            <span v-if="errors.category" class="form-error">{{ errors.category }}</span>
          </div>

          <!-- メッセージフィールド -->
          <div class="form-group">
            <label class="input-label" for="contact-message">メッセージ</label>
            <textarea
              id="contact-message"
              v-model="form.message"
              class="player-row__input contact-textarea"
              :class="{ 'input--error': errors.message }"
              placeholder="お問い合わせ内容を入力してください"
              rows="5"
            ></textarea>
            <span v-if="errors.message" class="form-error">{{ errors.message }}</span>
          </div>

          <!-- 送信ボタン（クリックで goConfirm() が呼ばれる） -->
          <button type="submit" class="btn-primary">確認画面へ</button>
        </form>
      </div>
    </template>

    <!-- SEO用セクション（サイト概要・FAQ・使い方・更新履歴） -->
    <section class="seo-section">
      <h2 class="seo-section__title">VALORANTランダムピックとは？</h2>
      <p class="seo-section__text">VALORANTのキャラ（エージェント）やマップを公平にランダム決定できる無料Webツールです。フルパでのカスタムゲームや縛りプレイ・トロールルーレット・スクリム時のキャラ被り防止などに活用できます。スマホ・PC対応、アカウント登録不要。</p>

      <h2 class="seo-section__title">使い方</h2>
      <ol class="seo-section__list">
        <li>バンしたいエージェントをタップして除外（任意）</li>
        <li>プレイヤー名を入力（空欄でも可・1〜5人対応）</li>
        <li>各プレイヤーのロールを絞り込む（任意）</li>
        <li>「抽選開始」ボタンを押すとルーレット演出後に各プレイヤーへエージェントが割り振られる</li>
      </ol>

      <h2 class="seo-section__title">よくある質問</h2>
      <dl class="seo-section__faq">
        <dt>無料で使えますか？</dt>
        <dd>はい、完全無料。アカウント登録・ログイン不要です。</dd>
        <dt>スマホでも使えますか？</dt>
        <dd>スマートフォン・タブレット・PCすべてに対応しています。</dd>
        <dt>チーム内でエージェントが被ることはありますか？</dt>
        <dd>同じチーム内での重複は発生しません。</dd>
        <dt>最新エージェントに対応していますか？</dt>
        <dd>2026年3月時点の全エージェント（25体）に対応しています。随時更新予定。</dd>
        <dt>5v5カスタムには使えますか？</dt>
        <dd>「Custom」タブでTEAM AとTEAM Bそれぞれ最大5人ずつ設定して抽選できます。</dd>
      </dl>

      <h2 class="seo-section__title">更新履歴</h2>
      <ul class="seo-section__list">
        <li>2026/03 — リリース開始</li>
        <li>2026/04 — 各URLを追加</li>
      </ul>

      <p class="seo-section__disclaimer">このサイトはRiot Gamesの公認・承認を受けたものではありません。VALORANTはRiot Games, Inc.の登録商標です。</p>
    </section>

  </div>
</template>

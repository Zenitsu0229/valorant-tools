<script setup>
import { ref } from 'vue'
import emailjs from '@emailjs/browser'
import './Contact.css'

const EMAILJS_SERVICE  = 'valorantToolsSuport'
const EMAILJS_TEMPLATE = 'template_droxhiq'
const EMAILJS_KEY      = '19eKLO4vnSkZSZ3eT'

const form = ref({
  name: '',
  email: '',
  category: '',
  message: '',
})

const categories = [
  { key: 'bug',     label: 'バグ報告' },
  { key: 'feature', label: '機能リクエスト' },
  { key: 'other',   label: 'その他' },
]

// 'form' | 'confirm' | 'sending' | 'done' | 'error'
const step     = ref('form')
const errors   = ref({})
const sendError = ref('')

function validate() {
  const e = {}
  if (!form.value.name.trim())    e.name     = '名前を入力してください'
  if (!form.value.email.trim())   e.email    = 'メールアドレスを入力してください'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))
                                  e.email    = '正しいメールアドレスを入力してください'
  if (!form.value.category)       e.category = 'カテゴリを選択してください'
  if (!form.value.message.trim()) e.message  = 'メッセージを入力してください'
  errors.value = e
  return Object.keys(e).length === 0
}

function goConfirm() {
  if (!validate()) return
  step.value = 'confirm'
}

async function send() {
  step.value  = 'sending'
  sendError.value = ''
  try {
    await emailjs.send(
      EMAILJS_SERVICE,
      EMAILJS_TEMPLATE,
      {
        from_name:  form.value.name,
        from_email: form.value.email,
        category:   categoryLabel(form.value.category),
        message:    form.value.message,
      },
      EMAILJS_KEY
    )
    step.value = 'done'
  } catch (err) {
    sendError.value = `送信に失敗しました（${err?.text ?? err}）。時間をおいて再度お試しください。`
    step.value = 'confirm'
  }
}

function reset() {
  form.value = { name: '', email: '', category: '', message: '' }
  errors.value = {}
  sendError.value = ''
  step.value = 'form'
}

function categoryLabel(key) {
  return categories.find(c => c.key === key)?.label ?? key
}
</script>

<template>
  <div class="contact-page">

    <!-- 送信完了 -->
    <div v-if="step === 'done'" class="contact-done">
      <div class="contact-done__icon">✓</div>
      <div class="contact-done__title">お問い合わせありがとうございます</div>
      <div class="contact-done__desc">内容を受け付けました。確認次第ご連絡いたします。</div>
      <button class="btn-primary contact-done__btn" @click="reset">戻る</button>
    </div>

    <!-- 確認画面 -->
    <template v-else-if="step === 'confirm' || step === 'sending'">
      <div class="section-title">CONFIRM</div>
      <div class="section-desc">以下の内容でお問い合わせを送信します。ご確認ください。</div>

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
            <dd class="confirm-value">{{ categoryLabel(form.category) }}</dd>
          </div>
          <div class="confirm-row confirm-row--message">
            <dt class="confirm-label">メッセージ</dt>
            <dd class="confirm-value confirm-value--message">{{ form.message }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="sendError" class="notice" style="margin-top:16px">{{ sendError }}</div>

      <div class="confirm-actions">
        <button class="btn-secondary" :disabled="step === 'sending'" @click="step = 'form'">修正する</button>
        <button class="btn-primary confirm-actions__send" :disabled="step === 'sending'" @click="send">
          {{ step === 'sending' ? '送信中...' : '送信する' }}
        </button>
      </div>
    </template>

    <!-- 入力フォーム -->
    <template v-else>
      <div class="section-title">CONTACT</div>
      <div class="section-desc">バグ報告・機能リクエスト・その他ご意見はこちらからどうぞ</div>

      <div class="card">
        <form class="contact-form" @submit.prevent="goConfirm" novalidate>

          <div class="form-group">
            <label class="input-label" for="contact-name">名前</label>
            <input
              id="contact-name"
              v-model="form.name"
              class="player-row__input"
              :class="{ 'input--error': errors.name }"
              type="text"
              placeholder="例: TenZ"
              autocomplete="name"
            />
            <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
          </div>

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

          <div class="form-group">
            <div class="input-label">カテゴリ</div>
            <div class="category-row">
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

          <button type="submit" class="btn-primary">確認画面へ</button>
        </form>
      </div>
    </template>

  </div>
</template>

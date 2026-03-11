<script setup>
import { ref } from 'vue'
import './Contact.css'

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

const submitted = ref(false)
const errors = ref({})

function validate() {
  const e = {}
  if (!form.value.name.trim())     e.name     = '名前を入力してください'
  if (!form.value.email.trim())    e.email    = 'メールアドレスを入力してください'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))
                                   e.email    = '正しいメールアドレスを入力してください'
  if (!form.value.category)        e.category = 'カテゴリを選択してください'
  if (!form.value.message.trim())  e.message  = 'メッセージを入力してください'
  errors.value = e
  return Object.keys(e).length === 0
}

function handleSubmit() {
  if (!validate()) return

  const subject = encodeURIComponent(`[VAL//RANDOM] ${categories.find(c => c.key === form.value.category)?.label ?? form.value.category}`)
  const body = encodeURIComponent(
    `名前: ${form.value.name}\nメール: ${form.value.email}\n\n${form.value.message}`
  )
  window.location.href = `mailto:contact@valrandom.example.com?subject=${subject}&body=${body}`

  submitted.value = true
}

function reset() {
  form.value = { name: '', email: '', category: '', message: '' }
  errors.value = {}
  submitted.value = false
}
</script>

<template>
  <div class="contact-page">

    <!-- 送信完了 -->
    <div v-if="submitted" class="contact-done">
      <div class="contact-done__icon">✓</div>
      <div class="contact-done__title">お問い合わせありがとうございます</div>
      <div class="contact-done__desc">メールクライアントが開きます。送信が完了したらご確認ください。</div>
      <button class="btn-primary contact-done__btn" @click="reset">戻る</button>
    </div>

    <!-- フォーム -->
    <template v-else>
      <div class="section-title">CONTACT</div>
      <div class="section-desc">バグ報告・機能リクエスト・その他ご意見はこちらからどうぞ</div>

      <div class="card">
        <form class="contact-form" @submit.prevent="handleSubmit" novalidate>

          <!-- 名前 -->
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

          <!-- メール -->
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

          <!-- カテゴリ -->
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

          <!-- メッセージ -->
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

          <button type="submit" class="btn-primary">送信する</button>
        </form>
      </div>

      <div class="notice">
        送信するとメールクライアントが開きます。メールが送信されない場合は直接 <strong>contact@valrandom.example.com</strong> にご連絡ください。
      </div>
    </template>

  </div>
</template>

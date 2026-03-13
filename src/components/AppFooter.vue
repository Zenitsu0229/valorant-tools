<script setup>
// 法的ページを開くよう親コンポーネントへ通知するイベント
// 引数: 'privacy' | 'terms' | 'cookie'
defineEmits(['showLegal'])
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">

      <!-- 公式 SNS リンク -->
      <div class="footer-section">
        <div class="footer-section__title">公式SNS</div>
        <div class="footer-sns">
          <!-- X (旧Twitter) -->
          <a href="https://x.com/kuyu0903" target="_blank" rel="noopener" class="footer-sns__link" aria-label="X (Twitter)">
            <svg class="footer-sns__icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/>
            </svg>
          </a>
          <!-- YouTube -->
          <a href="https://www.youtube.com/@kuyu0903" target="_blank" rel="noopener" class="footer-sns__link" aria-label="YouTube">
            <svg class="footer-sns__icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
      </div>

      <div class="footer-divider"></div>

      <!-- 法的リンク・著作権 -->
      <div class="footer-section footer-section--legal">
        <div class="footer-legal">
          <!-- クリックで App.vue の openLegal() を呼び出す -->
          <button class="footer-legal__link" @click="$emit('showLegal', 'terms')">利用規約</button>
          <span class="footer-legal__sep">|</span>
          <button class="footer-legal__link" @click="$emit('showLegal', 'privacy')">プライバシーポリシー</button>
          <span class="footer-legal__sep">|</span>
          <button class="footer-legal__link" @click="$emit('showLegal', 'cookie')">Cookieポリシー</button>
        </div>
        <div class="footer-copy">
          © 2026 zenzen.　このサイトはRiot Gamesの公認・承認を受けたものではありません。VALORANTはRiot Games, Inc.の登録商標です。
        </div>
      </div>

    </div>
  </footer>
</template>

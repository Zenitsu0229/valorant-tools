<template>
  <div class="legal-page">
    <button class="legal-back" @click="$emit('close')">← 戻る</button>

    <div class="legal-header">
      <div class="legal-title">Cookie Policy</div>
      <div class="legal-meta">Cookieポリシー｜最終更新日：2025年3月11日</div>
    </div>

    <div class="legal-body">

      <div class="legal-section">
        <h2>1. Cookieとは</h2>
        <p>
          Cookie（クッキー）とは、ウェブサイトがユーザーのブラウザに保存する小さなテキストデータです。
          Cookieはサイトの利便性向上・利用状況の分析・広告のパーソナライズ等に利用されます。
        </p>
        <p>
          ブラウザの設定からCookieを無効にすることが可能ですが、
          一部のサイト機能が動作しなくなる場合があります。
        </p>
      </div>

      <div class="legal-section">
        <h2>2. 当サイトが使用するCookieの種類</h2>
        <table class="legal-table">
          <thead>
            <tr>
              <th>種類</th>
              <th>提供元</th>
              <th>目的</th>
              <th>保持期間</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>機能Cookie</td>
              <td>当サイト</td>
              <td>入力内容・設定の一時保持（プレイヤー名等）</td>
              <td>セッション中のみ</td>
            </tr>
            <tr>
              <td>分析Cookie</td>
              <td>Vercel Inc.</td>
              <td>サイトパフォーマンスの計測（Speed Insights）</td>
              <td>最大30日</td>
            </tr>
            <tr>
              <td>広告Cookie</td>
              <td>Google LLC</td>
              <td>パーソナライズ広告の配信（Google AdSense）</td>
              <td>最大13ヶ月</td>
            </tr>
            <tr>
              <td>DoubleClick DART Cookie</td>
              <td>Google LLC</td>
              <td>広告の配信・測定</td>
              <td>最大13ヶ月</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="legal-section">
        <h2>3. 機能Cookie（当サイト）</h2>
        <p>
          当サイトはユーザーが入力したプレイヤー名・ロール設定等をブラウザのローカルストレージに
          一時保存することがあります。これらのデータは当サイトのサーバーには送信されず、
          ユーザーのブラウザ内にのみ保存されます。
        </p>
      </div>

      <div class="legal-section">
        <h2>4. 分析Cookie（Vercel Speed Insights）</h2>
        <p>
          当サイトはVercel Inc.の「Vercel Speed Insights」を使用してサイトのパフォーマンスを計測しています。
          収集されるデータはページの読み込み速度・デバイス情報等に限定され、
          個人を特定できる情報は収集されません。データはVercelのサーバーに送信されます。
        </p>
        <p>
          詳細：
          <a href="https://vercel.com/docs/speed-insights/privacy" target="_blank" rel="noopener">
            Vercel Speed Insights プライバシー情報
          </a>
        </p>
      </div>

      <div class="legal-section">
        <h2>5. 広告Cookie（Google AdSense）</h2>
        <p>
          当サイトはGoogle LLCの「Google AdSense」を通じて広告を配信しています。
          GoogleはCookieを使用して、ユーザーがGoogleまたはそのパートナーサイトを訪問した際の情報に基づき、
          関連性の高い広告を表示します。
        </p>
        <h3>DoubleClick DART Cookieについて</h3>
        <p>
          Googleは広告配信にDoubleClick DART Cookieを使用することがあります。
          このCookieは <strong>google.com</strong> ドメインから配信され、
          ユーザーの当サイトおよび他サイトへのアクセス情報をもとに広告を最適化します。
        </p>
        <p>
          Googleのプライバシーポリシー：
          <a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noopener">
            https://policies.google.com/privacy?hl=ja
          </a>
        </p>
      </div>

      <div class="legal-section">
        <h2>6. Cookieの管理・オプトアウト方法</h2>
        <h3>ブラウザの設定から無効化する</h3>
        <p>各ブラウザの設定からCookieを無効にすることができます。</p>
        <ul>
          <li>
            <a href="https://support.google.com/chrome/answer/95647?hl=ja" target="_blank" rel="noopener">Google Chrome</a>
          </li>
          <li>
            <a href="https://support.mozilla.org/ja/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener">Mozilla Firefox</a>
          </li>
          <li>
            <a href="https://support.apple.com/ja-jp/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Apple Safari</a>
          </li>
          <li>
            <a href="https://support.microsoft.com/ja-jp/windows/microsoft-edge-%E3%81%A7-cookie-%E3%82%92%E5%89%8A%E9%99%A4%E3%81%99%E3%82%8B-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener">Microsoft Edge</a>
          </li>
        </ul>

        <h3>Google広告のパーソナライズを無効化する</h3>
        <p>
          以下のページからGoogleのパーソナライズ広告をオプトアウトできます。<br>
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">
            https://www.google.com/settings/ads
          </a>
        </p>

        <h3>第三者配信事業者のCookieを一括オプトアウトする</h3>
        <p>
          <a href="https://optout.aboutads.info/" target="_blank" rel="noopener">
            https://optout.aboutads.info/
          </a>
          より、複数の広告配信事業者のCookieをまとめてオプトアウトすることができます。
        </p>
      </div>

      <div class="legal-section">
        <h2>7. Cookieポリシーの変更</h2>
        <p>
          当サイトは、サービス内容の変更や法令改正に伴い、本Cookieポリシーを予告なく改訂することがあります。
          改訂後は当サイトへの掲載をもって効力が生じます。
        </p>
      </div>

      <div class="legal-section">
        <h2>8. お問い合わせ</h2>
        <p>
          本Cookieポリシーに関するご質問は下記までご連絡ください。<br>
          メール：<a href="mailto:contact@valrandom.example.com">contact@valrandom.example.com</a>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>

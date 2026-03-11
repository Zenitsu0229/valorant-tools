<template>
  <div class="legal-page">
    <button class="legal-back" @click="$emit('close')">← 戻る</button>

    <div class="legal-header">
      <div class="legal-title">Privacy Policy</div>
      <div class="legal-meta">プライバシーポリシー｜最終更新日：2025年3月11日</div>
    </div>

    <div class="legal-body">

      <div class="legal-section">
        <h2>1. 基本方針</h2>
        <p>
          VAL//RANDOM（以下「当サイト」）は、ユーザーの個人情報の保護を重要事項と考え、
          個人情報の保護に関する法律（個人情報保護法）および関連法令を遵守します。
          本プライバシーポリシーは、当サイトが収集する情報の種類・利用目的・管理方法について説明するものです。
        </p>
        <div class="legal-highlight">
          当サイトはVALORANTのランダムエージェントピックを補助するツールサイトです。
          ユーザーアカウントの作成や、氏名・住所等の個人を直接特定できる情報の収集は行っておりません。
        </div>
      </div>

      <div class="legal-section">
        <h2>2. 運営者情報</h2>
        <p>
          サイト名：VAL//RANDOM<br>
          お問い合わせ：<a href="mailto:contact@valrandom.example.com">contact@valrandom.example.com</a>
        </p>
      </div>

      <div class="legal-section">
        <h2>3. 収集する情報</h2>
        <p>当サイトでは、以下の情報を収集する場合があります。</p>
        <h3>3-1. アクセスログ・行動情報</h3>
        <ul>
          <li>IPアドレス、ブラウザの種類・バージョン</li>
          <li>OS・デバイスの種類</li>
          <li>参照元URL（リファラー）</li>
          <li>ページビュー数・滞在時間などのサイト利用状況</li>
          <li>アクセス日時</li>
        </ul>
        <p>これらはアクセス解析ツールおよび広告配信サービスを通じて自動的に収集されます。</p>

        <h3>3-2. お問い合わせ時の情報</h3>
        <p>
          お問い合わせフォームをご利用の場合、お名前・メールアドレス・メッセージ内容を収集します。
          収集した情報はお問い合わせへの対応のみに使用し、第三者に提供することはありません。
        </p>

        <h3>3-3. Cookieおよびローカルストレージ</h3>
        <p>
          当サイトはCookieおよびブラウザのローカルストレージを使用します。
          詳細は「<a href="#" @click.prevent="$emit('changePage', 'cookie')">Cookieポリシー</a>」をご参照ください。
        </p>
      </div>

      <div class="legal-section">
        <h2>4. 広告の配信について（Google AdSense）</h2>
        <p>
          当サイトはGoogle LLCが提供するインターネット広告サービス「Google AdSense」を利用しています。
          Google AdSenseは、広告配信のためにCookie（DoubleClick COOKIEを含む）を使用し、
          ユーザーが過去に当サイトや他のサイトを訪問した際の情報に基づいてパーソナライズされた広告を表示することがあります。
        </p>
        <ul>
          <li>Googleはユーザーのブラウザに広告配信用のCookieを設定する場合があります。</li>
          <li>ユーザーはGoogleの広告設定ページでパーソナライズ広告を無効にすることができます。</li>
          <li>また、aboutads.info より第三者配信事業者のCookieを無効にすることができます。</li>
        </ul>
        <p>
          Google AdSenseおよびDoubleClick COOKIEの詳細については、
          <a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener">
            Googleの広告ポリシー
          </a>をご参照ください。
        </p>
        <p>
          パーソナライズ広告のオプトアウト：
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">
            https://www.google.com/settings/ads
          </a>
        </p>
      </div>

      <div class="legal-section">
        <h2>5. アクセス解析ツールについて</h2>
        <p>
          当サイトはVercel Inc.が提供する「Vercel Speed Insights」を使用してアクセス解析を行っています。
          このツールはサイトのパフォーマンス改善を目的として、ページの読み込み速度・ユーザー環境等の
          情報を匿名で収集します。収集されたデータに個人を特定できる情報は含まれません。
        </p>
        <p>
          Vercelのプライバシーポリシー：
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">
            https://vercel.com/legal/privacy-policy
          </a>
        </p>
      </div>

      <div class="legal-section">
        <h2>6. 第三者へのデータ提供</h2>
        <p>当サイトは、以下の場合を除き、収集した情報を第三者に提供することはありません。</p>
        <ul>
          <li>ユーザー本人の同意がある場合</li>
          <li>法令に基づき開示が必要な場合</li>
          <li>人の生命・身体または財産の保護のために必要な場合</li>
        </ul>
        <p>
          広告配信・アクセス解析のために、Google LLC・Vercel Inc. 等の第三者サービスと
          Cookie等の技術情報を共有する場合があります（上記4・5項参照）。
        </p>
      </div>

      <div class="legal-section">
        <h2>7. 未成年者について</h2>
        <p>
          当サイトは13歳未満のお子様を対象としたサービスではありません。
          13歳未満の方のご利用は保護者の同意のもとで行ってください。
          13歳未満の方から意図せず個人情報を収集した場合、速やかに削除対応いたします。
        </p>
      </div>

      <div class="legal-section">
        <h2>8. セキュリティ</h2>
        <p>
          当サイトはHTTPS通信を採用し、情報の安全な転送に努めています。
          ただし、インターネット上の通信は完全な安全を保証するものではありません。
          当サイトへの情報送信はユーザー自身の判断と責任のもとで行ってください。
        </p>
      </div>

      <div class="legal-section">
        <h2>9. プライバシーポリシーの変更</h2>
        <p>
          当サイトは、法令の改正・サービス内容の変更等に伴い、本プライバシーポリシーを予告なく改訂することがあります。
          改訂後のプライバシーポリシーは、当サイトに掲載した時点で効力を生じます。
          定期的にご確認いただくことをお勧めします。
        </p>
      </div>

      <div class="legal-section">
        <h2>10. お問い合わせ</h2>
        <p>
          本プライバシーポリシーに関するご質問・ご意見、または個人情報の開示・訂正・削除のご請求は
          下記までご連絡ください。
        </p>
        <p>
          メール：<a href="mailto:contact@valrandom.example.com">contact@valrandom.example.com</a>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
defineEmits(['close', 'changePage'])
</script>

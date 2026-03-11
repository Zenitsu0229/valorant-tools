<template>
  <div class="legal-page">
    <button class="legal-back" @click="$emit('close')">← 戻る</button>

    <div class="legal-header">
      <div class="legal-title">Terms of Service</div>
      <div class="legal-meta">利用規約｜最終更新日：2025年3月11日</div>
    </div>

    <div class="legal-body">

      <div class="legal-section">
        <h2>1. はじめに</h2>
        <p>
          VAL//RANDOM（以下「当サイト」）は、VALORANTのランダムエージェントピックを補助する非公式ファンサイトです。
          当サイトをご利用になる前に、本利用規約をよくお読みください。
          当サイトにアクセスまたは利用した時点で、本規約に同意したものとみなします。
        </p>
        <div class="legal-highlight">
          当サイトはRiot Games, Inc.とは一切関係のない非公式のファンサイトです。
          VALORANT、Riot GamesおよびそのロゴはRiot Games, Inc.の商標または登録商標です。
        </div>
      </div>

      <div class="legal-section">
        <h2>2. サービスの内容</h2>
        <p>当サイトは以下の機能を無償で提供します。</p>
        <ul>
          <li>VALORANTエージェントのランダム選択（Competitive形式）</li>
          <li>5v5 カスタムマッチ向けのランダム選択</li>
          <li>マップのランダム選択</li>
        </ul>
        <p>
          当サイトはゲームの公式クライアントとは連携しておらず、
          ゲームデータや個人のゲームアカウントへはアクセスしません。
        </p>
      </div>

      <div class="legal-section">
        <h2>3. 知的財産権</h2>
        <h3>3-1. 当サイトのコンテンツ</h3>
        <p>
          当サイトのシステム・デザイン・ソースコードに関する知的財産権は運営者に帰属します。
          無断複製・転載・再配布を禁じます。
        </p>
        <h3>3-2. 第三者の知的財産</h3>
        <p>
          VALORANTのゲームデータ（エージェント名・マップ名・ロール名等）はRiot Games, Inc.の知的財産です。
          当サイトはRiot Gamesの
          <a href="https://www.riotgames.com/ja/legal" target="_blank" rel="noopener">ファンコンテンツポリシー</a>
          に基づき非商業目的での利用を行っています。
        </p>
      </div>

      <div class="legal-section">
        <h2>4. 禁止事項</h2>
        <p>ユーザーは当サイトの利用にあたり、以下の行為を行ってはなりません。</p>
        <ul>
          <li>当サイトのサーバーに過大な負荷をかける行為（スクレイピング・DDoS攻撃等）</li>
          <li>当サイトのコンテンツを無断で複製・改変・再配布する行為</li>
          <li>法令または公序良俗に違反する行為</li>
          <li>当サイトの運営を妨害する行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ul>
      </div>

      <div class="legal-section">
        <h2>5. 免責事項</h2>
        <h3>5-1. 情報の正確性</h3>
        <p>
          当サイトが提供するエージェント・マップ等のゲーム情報は、可能な限り最新の情報を反映するよう努めますが、
          ゲームのアップデートにより情報が古くなる場合があります。
          情報の正確性・完全性・最新性を保証するものではありません。
        </p>
        <h3>5-2. サービスの利用</h3>
        <p>
          当サイトの利用により生じたいかなる損害（直接的・間接的を問わず）についても、
          運営者は責任を負いません。サービスは現状のまま（AS IS）提供されます。
        </p>
        <h3>5-3. 外部リンク</h3>
        <p>
          当サイトから外部サイトへのリンクを含む場合がありますが、
          外部サイトの内容・プライバシーポリシーについて運営者は責任を負いません。
        </p>
      </div>

      <div class="legal-section">
        <h2>6. 広告について</h2>
        <p>
          当サイトはGoogle AdSenseを通じた広告を掲載する場合があります。
          広告収益はサイトの維持・運営費用に充てられます。
          広告内容は広告配信事業者が管理するものであり、
          当サイトは広告内容について責任を負いません。
        </p>
      </div>

      <div class="legal-section">
        <h2>7. サービスの変更・中断・終了</h2>
        <p>
          運営者は予告なくサービス内容の変更・機能の追加・削除を行う場合があります。
          また、メンテナンス・障害・その他やむを得ない事情により、
          サービスを一時中断または終了する場合があります。
          これにより生じた損害について、運営者は責任を負いません。
        </p>
      </div>

      <div class="legal-section">
        <h2>8. 準拠法・管轄裁判所</h2>
        <p>
          本規約は日本法に準拠し、解釈されます。
          本規約に関する紛争については、運営者の所在地を管轄する日本の裁判所を
          第一審の専属的合意管轄裁判所とします。
        </p>
      </div>

      <div class="legal-section">
        <h2>9. お問い合わせ</h2>
        <p>
          本利用規約に関するご質問は下記までご連絡ください。<br>
          メール：<a href="mailto:contact@valrandom.example.com">contact@valrandom.example.com</a>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>

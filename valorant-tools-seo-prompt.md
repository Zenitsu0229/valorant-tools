# VALORANT Tools SEO・LLM対策 Claude Codeプロンプト

## 対象サイト
https://valorant-tools-two.vercel.app/

---

## 📊 競合調査サマリー（Claude調査済み）

### 主要競合サイト

| サイト | 特徴 | 強み |
|--------|------|------|
| **risyu.org/tool/valo/** | 日本語・単体キャラルーレット | SEO最適化済み、多言語対応(EN/ES/KO)、画像豊富 |
| **valorantpicker.com** | 英語・エージェント選択 | シンプルUI、GitHub連携、SEO強い |
| **randomheropicker.com** | 英語・ロール別フィルタ | 詳細な解説文、構造化コンテンツ |
| **gospinwheel.com/valorant-wheel** | 英語・ホイール型 | FAQ構造化データ、2026年最新エージェント対応 |
| **lan-gaming.net/valorant-team-shuffle/** | 日本語・チーム分けツール | ランク入力機能、マップローテーション対応 |
| **tk-production.xyz/troll-streaming/** | 日本語・フルパトロールガチャ | 縛りプレイ特化 |

### 競合が持っていてあなたのサイトにないもの
- **多言語対応**（英語・韓国語）
- **エージェント詳細情報ページ**（各エージェントのアビリティ解説）
- **FAQ セクション**（構造化データ対応）
- **SNSシェアボタン**（X/Twitter, LINE）
- **OGP画像**（SNSシェア時のプレビュー）
- **構造化データ (JSON-LD)**
- **llms.txt**
- **sitemap.xml**
- **更新履歴・新エージェント対応アナウンス**

---

## 🎯 ターゲットキーワード分析

### 高優先度キーワード（日本語）
```
- VALORANT キャラルーレット
- ヴァロラント ランダムピック
- VALORANT エージェント ランダム
- バロラント キャラ ランダム決め
- VALORANT 5人 ランダムピック
- ヴァロラント チーム割り振り ツール
- VALORANT フルパ ランダム
- バロラント 縛りプレイ ルーレット
- VALORANT マップ ランダム
- ヴァロラント カスタム キャラ決め
```

### 中優先度キーワード（日本語）
```
- VALORANT トロールルーレット
- バロラント スクリム キャラ決め
- ヴァロラント ロール指定 ランダム
- VALORANT バン機能 ランダムピック
- バロラント 5v5 チーム決め
```

### 英語キーワード（将来の多言語対応用）
```
- VALORANT random agent picker
- Valorant agent roulette 5 players
- Valorant team random picker
- Valorant map roulette
```

---

## 🔧 実装すべきSEO対策（優先度順）

### 【Priority 1】テクニカルSEO基盤

#### 1. メタタグ完全最適化
各ページ（Competitive/Custom/Mapタブ）に対して：

```html
<!-- index.html の <head> に追加 -->
<meta name="description" content="VALORANTのキャラ（エージェント）とマップをランダムに決定できる無料ツール。5人のプレイヤー名を入力するだけで即座にランダムピック。バン機能・ロール指定・5v5カスタム対応。フルパ・スクリム・縛りプレイに最適。">
<meta name="keywords" content="VALORANT,ヴァロラント,バロラント,キャラルーレット,ランダムピック,エージェント,ランダム,5人,フルパ,チーム割り振り,マップルーレット,縛りプレイ,トロール,スクリム,カスタム">
<meta name="author" content="VALORANT Tools">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://valorant-tools-two.vercel.app/">

<!-- OGP (Open Graph Protocol) -->
<meta property="og:title" content="VALORANTランダムピック・ルーレット | キャラ・マップ自動選択ツール【無料】">
<meta property="og:description" content="VALORANTのキャラとマップをランダムに決定。5人のプレイヤー名を入力するだけ。バン機能・ロール指定・5v5カスタム対応の無料ツール。">
<meta property="og:type" content="website">
<meta property="og:url" content="https://valorant-tools-two.vercel.app/">
<meta property="og:image" content="https://valorant-tools-two.vercel.app/ogp.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ja_JP">
<meta property="og:site_name" content="VALORANT ランダムピックツール">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="VALORANTランダムピック・ルーレット【無料】">
<meta name="twitter:description" content="5人のプレイヤー名を入力するだけでVALORANTのキャラ・マップをランダム決定。バン機能・ロール指定対応。">
<meta name="twitter:image" content="https://valorant-tools-two.vercel.app/ogp.png">
```

#### 2. JSON-LD 構造化データ（最重要）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "VALORANTランダムピック・ルーレット",
  "url": "https://valorant-tools-two.vercel.app/",
  "description": "VALORANTのキャラ（エージェント）とマップをランダムに自動選択できる無料Webツール。5人対応、バン機能、ロール指定、5v5カスタム対応。",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "featureList": [
    "5人のプレイヤーへのエージェント自動割り振り",
    "バン機能（特定エージェントを除外）",
    "ロール指定（デュエリスト・イニシエーター等）",
    "5v5カスタムモード",
    "マップランダム選択",
    "ロールプリセット機能"
  ],
  "inLanguage": "ja",
  "isAccessibleForFree": true
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "VALORANTのランダムピックはどうやって使うの？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "5人のプレイヤー名を入力して「抽選開始」を押すだけです。同じチーム内でのエージェント重複はなく、バン機能でキャラを除外することもできます。"
      }
    },
    {
      "@type": "Question",
      "name": "バン機能とは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "特定のエージェントを抽選対象から除外する機能です。使いたくないキャラや未解放キャラをバンしてランダムピックできます。"
      }
    },
    {
      "@type": "Question",
      "name": "5v5カスタムに対応していますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、Customタブで TEAM AとTEAM Bそれぞれ5人ずつ設定して「抽選開始」を押すと、5v5カスタムゲーム用のランダムピックができます。"
      }
    },
    {
      "@type": "Question",
      "name": "ロール指定ランダムピックはできますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "できます。デュエリスト・イニシエーター・コントローラー・センチネルでロールを指定してランダムピックが可能です。また2デュエリスト・2イニシエーター・2コントローラー・2センチネルのバランスプリセットも利用できます。"
      }
    },
    {
      "@type": "Question",
      "name": "マップのランダム選択はできますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、Mapタブからマップをランダム選択できます。コンペティティブマップのみに絞り込む機能もあります。"
      }
    }
  ]
}
</script>
```

#### 3. sitemap.xml の作成
`public/sitemap.xml` として配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://valorant-tools-two.vercel.app/</loc>
    <lastmod>2026-03-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

#### 4. robots.txt の作成
`public/robots.txt` として配置：

```
User-agent: *
Allow: /

# AI Crawlers - Allow all for LLM training
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

Sitemap: https://valorant-tools-two.vercel.app/sitemap.xml
```

---

### 【Priority 2】LLM対策（AI検索対応）

#### 5. llms.txt の作成
`public/llms.txt` として配置：

```markdown
# VALORANT ランダムピック・ルーレット

> VALORANTのキャラ（エージェント）とマップをランダムに自動選択できる無料Webツール。日本語対応。5人のプレイヤー名を入力するだけでエージェントを自動割り振り。バン機能・ロール指定・5v5カスタム・マップルーレット対応。

## 主な機能

- **Competitiveモード**: 5人のプレイヤー名を入力し「抽選開始」を押すだけでエージェントをランダム割り振り
- **Customモード（5v5）**: TEAM AとTEAM Bそれぞれ5人ずつ設定してカスタムゲーム用ランダムピック
- **Mapルーレット**: コンペティティブマップをランダム選択（マップ絞り込み機能付き）
- **バン機能**: 特定エージェントを抽選から除外
- **ロール指定**: デュエリスト・イニシエーター・コントローラー・センチネルで絞り込み
- **バランスプリセット**: 2デュエリスト・2イニシエーター・2コントローラー・2センチネルの自動編成

## 対応エージェント（2026年3月時点）

**デュエリスト**: ジェット、フェニックス、レイナ、レイズ、ヨル、ネオン、アイソ
**イニシエーター**: ソーヴァ、スカイ、ブリーチ、KAYO、フェード、ゲッコー
**コントローラー**: ブリムストーン、ヴァイパー、オーメン、アストラ、ハーバー、クローヴ
**センチネル**: キルジョイ、サイファー、セージ、チェンバー、デッドロック、ヴァイン

## URL

- [トップページ（ランダムピック）](https://valorant-tools-two.vercel.app/)
```

---

### 【Priority 3】コンテンツSEO強化

#### 6. ページ内コンテンツの充実

以下のセクションをHTMLに追加する（SEOテキストとして）：

**追加すべきコンテンツセクション：**

```
## VALORANTランダムピックとは？

VALORANTのキャラ（エージェント）やマップを公平にランダム決定するWebツールです。
フルパでのカスタムゲームや縛りプレイ、スクリム時のキャラ被り防止に活用できます。

## よくある質問（FAQ）

Q: スマホでも使えますか？
A: はい、スマートフォン・タブレットでもご利用いただけます。

Q: 無料で使えますか？
A: 完全無料でご利用いただけます。登録不要です。

Q: 最新エージェントに対応していますか？
A: 定期的にエージェントリストを更新しています。（更新日：2026年3月）

## 使い方詳細

### Competitiveモードの使い方
1. 「Competitive」タブを選択
2. 5人のプレイヤー名を入力（空欄でも可）
3. 必要に応じてバンしたいエージェントを選択
4. 「抽選開始」ボタンをクリック
5. 各プレイヤーに割り当てられたエージェントが表示される

### Customモード（5v5）の使い方
1. 「Custom」タブを選択
2. TEAM AとTEAM Bそれぞれにプレイヤー名を入力
3. 「抽選開始」ボタンをクリック
4. チーム間の重複はOK（同キャラでも可）

### Mapルーレットの使い方
1. 「Map」タブを選択
2. 必要に応じてコンペティティブマップのみに絞り込む
3. 「マップ抽選」ボタンをクリック

## 更新履歴

- 2026/03: ヴァイン追加対応
- 2025: クローヴ追加対応
- 2024: アイソ追加対応
```

#### 7. SNSシェア機能の追加

```html
<!-- 抽選結果表示後に表示するシェアボタン -->
<div class="share-buttons">
  <a href="https://twitter.com/intent/tweet?text=VALORANTランダムピック結果！%23VALORANT%20%23ヴァロラント&url=https://valorant-tools-two.vercel.app/" 
     target="_blank" rel="noopener" class="btn-share-twitter">
    Xでシェア
  </a>
  <a href="https://line.me/R/msg/text/?VALORANTランダムピック！https://valorant-tools-two.vercel.app/" 
     target="_blank" rel="noopener" class="btn-share-line">
    LINEでシェア
  </a>
</div>
```

---

### 【Priority 4】UX・コンテンツ充実でSEO間接強化

#### 8. エージェント情報ページ（または詳細表示）

各エージェントについて以下の情報を追加表示（ツールチップまたは専用セクション）：
- ロール（デュエリスト等）
- 特徴的なアビリティ1行説明
- 難易度（初心者向け/上級者向け）
- おすすめマップ

例：
```json
{
  "ジェット": {
    "role": "デュエリスト",
    "description": "高機動型。ダッシュとアップドラフトで垂直・水平に素早く移動。",
    "difficulty": "中級",
    "recommendedMaps": ["アセント", "へイブン", "ビンド"]
  }
}
```

#### 9. ページ表示速度の最適化

- エージェント画像の遅延読み込み（`loading="lazy"`）
- 画像のWebP変換
- CSSの最小化

#### 10. 内部リンク構造

将来的に複数ページ構成にする場合（例：エージェント一覧ページ、使い方ページ）：
- 各ページからトップへの内部リンク
- パンくずリスト（BreadcrumbList 構造化データ）

---

## 📁 追加すべきファイル一覧

```
public/
├── robots.txt          ← 新規作成
├── sitemap.xml         ← 新規作成
├── llms.txt            ← 新規作成（LLM対策）
├── ogp.png             ← 新規作成（1200×630px OGP画像）
└── index.html          ← メタタグ・JSON-LD・コンテンツ追加
```

---

## 🚀 Claude Codeへの具体的な作業依頼

以下をClaudeに依頼してください：

```
以下のファイルをプロジェクトに追加・修正してください：

1. public/robots.txt を作成（AI crawlerを全許可）
2. public/sitemap.xml を作成
3. public/llms.txt を作成（LLM向けサイト説明）
4. index.html に以下を追加：
   - <head>内にOGP・Twitter Card・canonicalメタタグ
   - <head>内にJSON-LD構造化データ（WebApplication + FAQPage）
   - ページ末尾にFAQセクション（アコーディオン形式）
   - ページ末尾に使い方詳細テキストセクション
   - ページ末尾に更新履歴セクション
   - 抽選結果表示後にSNSシェアボタン（X/LINE）

5. title タグを以下に変更：
   「VALORANTランダムピック・ルーレット | キャラ・マップ自動選択ツール【無料・スマホ対応】」

6. h1 タグをページに1つだけ配置し、キーワードを含める

7. alt属性が空になっているエージェント画像にキャラ名を設定
   例: alt="ジェット - VALORANTデュエリスト"

8. すべての外部リンクに rel="noopener noreferrer" を追加

これらの変更でSEOとAI検索（ChatGPT/Claude/Perplexity等）への露出を高めることが目標です。
```

---

## 📈 競合との差別化ポイント（コンテンツ戦略）

現在の強み（維持すべき機能）：
- **5人同時ランダムピック**（競合の多くは1人用）
- **バン機能**
- **5v5カスタム対応**
- **ロールプリセット**

追加で差別化できる機能アイデア：
- 武器ランダム選択（競合: egs-net.info/tool/valorant_weapon/）
- シーズン/マップローテーション連動
- 結果をURLパラメータで共有可能に
- 抽選結果の画像生成（SNSシェア用）

---

## ⚠️ 注意事項

- VALORANT / Riot Gamesの著作権に注意。エージェント画像をスクレイピングして使用する場合は権利確認が必要
- ファンサイトであることを明示する disclaimer を追加すること：
  `「このサイトはRiot Gamesの公認・承認を受けたものではありません。VALORANTはRiot Games, Inc.の登録商標です。」`
- SEOで過剰なキーワード詰め込みはGoogleにペナルティを受けるため、自然な文章で記述すること

---

*調査日: 2026年3月12日 by Claude Sonnet 4.6*

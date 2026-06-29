# 📊 ホテル予約需要予測システム

過去の予約データをもとにAIが今後の予約需要を予測し、価格戦略・人員配置計画をサポートするWebアプリです。

🖥️ **[デモを見る](https://hotelpredict.pages.dev/)**

---

## ✨ 主な機能

- **需要予測ダッシュボード** — AIによる今後の予約数・稼働率の予測を可視化
- **価格最適化提案** — 需要予測をもとにした動的価格設定の提案
- **人員配置計画** — 予測稼働率に応じた最適スタッフ数の算出
- **過去データ分析** — 予約履歴の傾向分析とレポート表示

## 🛠️ 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | React 19 / TypeScript |
| スタイリング | Tailwind CSS 4 |
| AI | Gemini API（需要予測） |
| ビルド | Vite 6 |
| デプロイ | Cloudflare Pages |

## 🚀 ローカル実行

```bash
git clone https://github.com/tatagen/hotelpredict.git
cd hotelpredict
npm install
npm run dev
```
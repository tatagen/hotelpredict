# 📊 ホテル宿泊価格 最適化システム

A市内のホテル向け宿泊価格分析ツールです。周辺イベント・稼働率・競合ホテルのデータをもとに適正価格を算出し、3ヶ月先の価格変動を予測します。

---

## ✨ 主な機能

- **価格比較・適正価格算出** — 稼働率・周辺ホテル相場・イベント需要を元に今日の適正価格を提示
- **3ヶ月先の価格変動予測** — カレンダー形式で将来の需要変動と推奨価格を可視化
- **イベントカレンダー連動** — 市民マラソン大会・温泉まつりなど地域イベントの需要影響を自動反映
- **稼働率シミュレーション** — 稼働率スライダーを動かすと価格・予測がリアルタイムで変化

## 🛠️ 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | React 19 / TypeScript |
| スタイリング | Tailwind CSS 4 |
| AI | Google Gemini API |
| サーバー | Express |
| ビルド | Vite 6 + esbuild |

## 🚀 ローカル実行

```bash
git clone https://github.com/tatagen/hotelpredict.git
cd hotelpredict
npm install
# .env.local に GEMINI_API_KEY を記入
npm run dev
```

> `GEMINI_API_KEY` の設定が必要です（[Google AI Studio](https://aistudio.google.com/) で無料取得できます）。

---

*温泉エリアのホテル「サンプルホテル」向けに開発しました。*
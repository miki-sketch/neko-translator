# 猫語翻訳アプリ — YouTube解析改善 Claude Code指示書

## 改善内容

### 1. YouTube動画を冒�bowheadから10秒で強制停止
### 2. 停止時に「何秒まで読み込んだか」をメッセージ表示

---

## 対象ファイル

- `src/hooks/useGemini.js`
- `src/components/YoutubeTab.jsx`
- `src/components/ResultBubble.jsx`（またはApp.jsx）

---

## useGemini.js の変更

### Gemini APIリクエストに `videoMetadata` を追加

YouTubeのURLをGemini APIに渡す際、`videoMetadata` で解析範囲を冒頭10秒に制限する。

```javascript
// YouTube用リクエストボディ
{
  "contents": [
    {
      "parts": [
        {
          "file_data": {
            "file_uri": "https://www.youtube.com/watch?v=XXXX"
          }
        },
        {
          "videoMetadata": {
            "startOffset": "0s",
            "endOffset": "10s"
          }
        },
        {
          "text": "{SYSTEM_PROMPT}"
        }
      ]
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 2048
  }
}
```

### 解析完了後のメッセージ用にレスポンスから情報を取得

- リクエスト送信時に `startOffset: "0s"`, `endOffset: "10s"` を固定値として渡す
- `translate()` 関数の戻り値に `analyzedDuration: "冒頭10秒"` を追加

```javascript
// useGemini.js の translate関数 戻り値に追加
return {
  voice: parsedVoice,
  reason: parsedReason,
  analyzedDuration: inputType === 'youtube' ? '冒頭10秒' : null
}
```

---

## YoutubeTab.jsx の変更

### 変更なし（UIはそのままでOK）

---

## ResultBubble.jsx の変更

### analyzedDuration が渡された場合にバナー表示

```jsx
// props: { voice, reason, analyzedDuration }

{analyzedDuration && (
  <div className="analyzed-duration-banner">
    <span>⏱ {analyzedDuration}を解析しました（YouTube節約モード）</span>
  </div>
)}
```

### スタイル（app.css または ResultBubble.module.css に追加）

```css
.analyzed-duration-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #FFF8E8;
  border: 0.5px solid #F0D080;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #8B6010;
}
```

---

## App.jsx の変更

`result` の `analyzedDuration` を `ResultBubble` に渡す。

```jsx
<ResultBubble
  voice={result.voice}
  reason={result.reason}
  analyzedDuration={result.analyzedDuration}
/>
```

---

## 完成後の動作イメージ

```
┌─────────────────────────────────────┐
│ ⏱ 冒頭10秒を解析しました           │
│   （YouTube節約モード）             │
├─────────────────────────────────────┤
│ 猫の心の声                          │
│ 「ねぇ、ここ居心地いいにゃ〜」      │
├─────────────────────────────────────┤
│ 翻訳の根拠                          │
│ 動画冒頭10秒の解析結果...           │
└─────────────────────────────────────┘
```

---

## 実装後にやること

```bash
git add . && git commit -m "feat: limit YouTube analysis to first 10s, show analyzed duration" && git push
```

---

## 注意事項

- `videoMetadata` の `startOffset` / `endOffset` は Gemini 2.5 Flash の仕様に準拠
- 文字列形式は `"0s"` `"10s"` のように秒単位で指定
- 動画が10秒未満の場合も endOffset: "10s" 指定で問題なし（動画終端まで解析される）

# useGemini.js YouTube修正指示

## 問題
videoMetadata を parts 配列に入れているためAPIエラーになっている。

## 修正箇所：src/hooks/useGemini.js

### YouTube用 parts を以下に変更

```javascript
if (inputType === 'youtube') {
  parts = [
    { file_data: { file_uri: youtubeUrl } },
    { text: promptText }
  ]
}
```

### fetch の body を以下に変更

```javascript
body: JSON.stringify({
  contents: [{ parts }],
  generationConfig: {
    maxOutputTokens: 2048,
    ...(inputType === 'youtube' && {
      videoMetadata: { startOffset: '0s', endOffset: '10s' }
    })
  }
})
```

## 修正完了後に実行

```
git add . && git commit -m "fix: move videoMetadata to correct position" && git push
```

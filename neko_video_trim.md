# 猫語翻訳アプリ — 動画トリミング機能追加

## 概要
動画ファイルをブラウザ上で指定秒数にトリミングしてからGeminiに送信する。
秒数はユーザーが入力可能（デフォルト15秒）。

---

## 1. VideoTab.jsx の変更

動画ファイル選択エリアの下に秒数入力欄を追加。

```jsx
// 秒数入力欄
<div className="trim-seconds-row">
  <label>解析する秒数</label>
  <input
    type="number"
    min={1}
    max={60}
    defaultValue={15}
    value={trimSeconds}
    onChange={e => setTrimSeconds(Number(e.target.value))}
  />
  <span>秒</span>
</div>
```

- trimSeconds の state を VideoTab 内で管理（デフォルト15）
- 親コンポーネント（App.jsx）に trimSeconds を渡す

---

## 2. fileToBase64.js に関数を追加

動画を指定秒数でトリミングしてBase64変換する関数を追加。

```javascript
export async function videoToBase64Trimmed(file, seconds) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const chunks = []

    video.src = URL.createObjectURL(file)
    video.muted = true

    video.onloadedmetadata = () => {
      const duration = Math.min(seconds, video.duration)
      const stream = canvas.captureStream()

      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaElementSource(video)
      const dest = audioCtx.createMediaStreamDestination()
      source.connect(dest)
      dest.stream.getAudioTracks().forEach(t => stream.addTrack(t))

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      recorder.ondataavailable = e => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const reader = new FileReader()
        reader.onload = ev => resolve({
          base64: ev.target.result.split(',')[1],
          mimeType: 'video/webm',
          actualSeconds: Math.round(duration)
        })
        reader.readAsDataURL(blob)
      }

      recorder.start()
      video.play()

      setTimeout(() => {
        recorder.stop()
        video.pause()
        audioCtx.close()
      }, duration * 1000)
    }

    video.onerror = reject
  })
}
```

---

## 3. useGemini.js の変更

- `translate()` の引数に `trimSeconds` を追加
- inputType が `'video'` の場合、`videoToBase64Trimmed(file, trimSeconds)` を使用
- `fileToBase64` の代わりに `videoToBase64Trimmed` をインポート
- result の `analyzedDuration` を動画の場合は実際の秒数で表示

```javascript
// video の場合
const { base64: data, mimeType: actualMime, actualSeconds } = await videoToBase64Trimmed(file, trimSeconds)
parts = [{ inline_data: { mime_type: actualMime, data } }, { text: promptText }]

// result に付与
analyzedDuration: inputType === 'video' ? `冒頭${actualSeconds}秒` :
                  inputType === 'youtube' ? '冒頭10秒' : null
```

---

## 4. App.jsx の変更

VideoTab から `trimSeconds` を受け取り、`translate()` に渡す。

---

## 完了後に実行

```
npm run build && git add . && git commit -m "feat: trim video to user-specified seconds before sending to Gemini" && git push
```

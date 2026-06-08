# 猫語翻訳アプリ — 抜本的リデザイン指示

## 概要
動画・音声タブをプレイヤー再生＋区間キャプチャ方式に変更。
YouTubeタブは従来通りURL送信だが、同意確認を追加。

---

## タブ構成（変更なし）
動画 / 音声 / YouTube の3タブ

---

## 動画タブ・音声タブ（共通の新UI）

### UIフロー
1. ファイル選択
2. プレイヤー表示（動画は`<video>`、音声は`<audio>`）
3. 再生ボタンで再生開始
4. 「録音開始」ボタン → 押した瞬間から MediaRecorder でキャプチャ開始
5. 「録音停止」ボタン → 押した瞬間でキャプチャ停止
6. キャプチャされた音声データをGeminiに送信

### ボタン状態管理
- ファイル未選択時：再生ボタン・録音開始ボタンはdisabled
- 再生中のみ：録音開始ボタンが有効
- 録音中：録音停止ボタンのみ表示（赤く点滅）
- 録音停止後：「この内容で翻訳する」ボタンを表示

### キャプチャ仕様
```javascript
// 動画・音声ともに音声トラックのみキャプチャ
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
// ただし自分のマイクではなく、再生中のメディアの音声を取得する

// 動画の場合
const videoEl = document.querySelector('video')
const audioCtx = new AudioContext()
const source = audioCtx.createMediaElementSource(videoEl)
const dest = audioCtx.createMediaStreamDestination()
source.connect(dest)
source.connect(audioCtx.destination) // スピーカーにも流す

const recorder = new MediaRecorder(dest.stream)
// recorder.start() → 録音開始ボタンで呼ぶ
// recorder.stop() → 録音停止ボタンで呼ぶ

recorder.ondataavailable = e => chunks.push(e.data)
recorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/webm' })
  // Base64変換してGeminiに送信
}
```

### Gemini送信
- mimeType: 'audio/webm'
- プロンプト：音声のみ解析（動画の映像情報なし）
- analyzedDuration：録音時間（秒）を計測して表示

---

## YouTubeタブ（同意確認を追加）

### UIフロー
1. YouTubeタブを選択した瞬間に注意モーダルを表示
2. ユーザーが「同意して使う」を押した場合のみURL入力欄を表示
3. 「キャンセル」を押したら動画タブに戻る

### 注意モーダルの文言
```
⚠️ YouTube利用の注意

YouTube URLを直接AIに送信するため、
動画全体が解析対象になります。

・長い動画は処理に数分かかる場合があります
・動画の長さに応じてAPIコストが増加します
・短い動画（1〜2分以内）の使用を推奨します

上記を理解した上で使用しますか？
```

ボタン：「同意して使う」（オレンジ）／「キャンセル」（グレー）

### 同意後のUI
- 従来通りURL入力欄を表示
- 秒数入力欄は不要（削除）
- 「短い動画推奨」の注意書きを常時表示

---

## App.jsx の変更

- trimSeconds state を削除（動画・音声は録音時間で自動計測、YouTube不要）
- 共通の「解析する秒数」入力欄を削除
- YouTubeタブ選択時に同意モーダルを表示するロジックを追加
- キャプチャされた音声Blobを受け取りGeminiに渡す

---

## useGemini.js の変更

- videoToBase64Trimmed() は不要になるため削除
- 動画・音声ともに audio/webm の Base64 を受け取って送信
- analyzedDuration を録音秒数で表示：`${recordedSeconds}秒間を解析しました`

---

## 新規コンポーネント

### src/components/YoutubeWarningModal.jsx
YouTube利用の注意モーダル。

### src/components/MediaPlayer.jsx
動画・音声共通のプレイヤー＋録音開始/停止UI。
動画タブ・音声タブ両方で使い回す。

---

## 削除するもの

- fileToBase64.js の videoToBase64Trimmed() 関数
- App.jsx の trimSeconds state と共通秒数入力欄
- VideoTab.jsx の秒数関連コード

---

## 完了後に実行

```
npm run build && git add . && git commit -m "feat: redesign player with record start/stop, add YouTube warning modal" && git push
```

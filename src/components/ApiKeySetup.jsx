import { useState } from 'react'
import { setApiKey } from '../utils/storage'

export default function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('')

  function handleSave() {
    const trimmed = key.trim()
    if (!trimmed) return
    setApiKey(trimmed)
    onSave()
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-cat">🐱</div>
        <h2 className="modal-title">Gemini APIキーを設定</h2>
        <p className="modal-desc">
          猫語を翻訳するためにGemini APIキーが必要です。{' '}
          <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
            Google AI Studio
          </a>
          から無料で取得できます。
        </p>
        <input
          className="modal-input"
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="AIza..."
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          autoFocus
        />
        <p className="modal-privacy">🔒 入力したAPIキーはお使いのブラウザ内にのみ保存されます</p>
        <button className="modal-btn" onClick={handleSave} disabled={!key.trim()}>
          設定して始める
        </button>
      </div>
    </div>
  )
}

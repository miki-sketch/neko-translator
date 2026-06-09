import { useState } from 'react'
import { getApiKey, setApiKey, isBuiltinMode, saveBuiltinMode, clearBuiltinMode } from '../utils/storage'

export default function ApiKeySetup({ onSave, onClose }) {
  const currentApiKey = getApiKey()
  const hasExistingConfig = !!currentApiKey || isBuiltinMode()

  const [useBuiltin, setUseBuiltin] = useState(isBuiltinMode())
  const [builtinPassword, setBuiltinPassword] = useState(localStorage.getItem('builtin_password') || '')
  const [key, setKey] = useState('')
  const [keyEditable, setKeyEditable] = useState(!currentApiKey)

  function handleSave() {
    if (useBuiltin) {
      if (!builtinPassword.trim()) return
      saveBuiltinMode(builtinPassword.trim())
      onSave()
    } else {
      const trimmed = key.trim()
      if (!trimmed) return
      clearBuiltinMode()
      setApiKey(trimmed)
      onSave()
    }
  }

  const canSave = useBuiltin
    ? !!builtinPassword.trim()
    : keyEditable && !!key.trim()

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

        <div className="builtin-api-section">
          <label className="builtin-label">
            <input
              type="checkbox"
              checked={useBuiltin}
              onChange={e => setUseBuiltin(e.target.checked)}
            />
            　みんなで使うAPIを利用する
          </label>
          {useBuiltin && (
            <input
              className="modal-input"
              type="password"
              placeholder="パスワードを入力"
              value={builtinPassword}
              onChange={e => setBuiltinPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          )}
        </div>

        {!useBuiltin && (
          <>
            <div className="modal-input-row">
              <input
                className="modal-input"
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder={currentApiKey && !keyEditable ? '••••••••••••••••' : 'AIza...'}
                disabled={!keyEditable}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus={!currentApiKey}
              />
              {currentApiKey && !keyEditable && (
                <button
                  className="change-btn"
                  onClick={() => { setKey(''); setKeyEditable(true) }}
                >
                  変更する
                </button>
              )}
            </div>
            <p className="modal-privacy">🔒 入力したAPIキーはお使いのブラウザ内にのみ保存されます</p>
          </>
        )}

        <button className="modal-btn" onClick={handleSave} disabled={!canSave}>
          設定して始める
        </button>

        {hasExistingConfig && onClose && (
          <button className="modal-close-btn" onClick={onClose}>× 閉じる</button>
        )}
      </div>
    </div>
  )
}

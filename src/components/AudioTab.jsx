import { useRef, useState } from 'react'
import { getAudioDuration } from '../utils/fileToBase64'

export default function AudioTab({ file, onChange, desc, onDescChange, onError }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  async function handleFile(f) {
    if (!f) return
    try {
      const duration = await getAudioDuration(f)
      if (duration > 10) { onError('音声は10秒以内にしてください。'); return }
      onError(null)
      onChange(f)
    } catch {
      onError('音声ファイルの読み込みに失敗しました。')
    }
  }

  function handleRemove(e) {
    e.stopPropagation()
    onChange(null)
    onError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="tab-content">
      <div
        className={`drop-zone${dragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/mp4,audio/wav,audio/x-m4a,.mp3,.m4a,.wav"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="drop-preview">
            <span className="drop-icon">🎙</span>
            <p className="file-name">{file.name}</p>
            <button className="change-btn" onClick={handleRemove}>削除</button>
          </div>
        ) : (
          <div className="drop-placeholder">
            <span className="drop-icon">🎙</span>
            <p className="drop-text">音声をドロップ、またはタップして選択</p>
            <p className="drop-hint">mp3 / m4a / wav・10秒以内</p>
          </div>
        )}
      </div>
      <textarea
        className="desc-textarea"
        value={desc}
        onChange={e => onDescChange(e.target.value)}
        placeholder="状況を補足（例：朝起きた直後、空腹時に鳴いている）"
        rows={3}
      />
    </div>
  )
}

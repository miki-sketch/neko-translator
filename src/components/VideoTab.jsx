import { useRef, useState } from 'react'
import { getVideoDuration } from '../utils/fileToBase64'

export default function VideoTab({ file, onChange, desc, onDescChange, onError }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  async function handleFile(f) {
    if (!f) return
    if (f.size > 20 * 1024 * 1024) { onError('動画は20MB以内にしてください。'); return }
    try {
      const duration = await getVideoDuration(f)
      if (duration > 10) { onError('動画は10秒以内にしてください。'); return }
      onError(null)
      onChange(f)
    } catch {
      onError('動画の読み込みに失敗しました。')
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
          accept="video/mp4,video/quicktime,.mp4,.mov"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="drop-preview">
            <span className="drop-icon">🎬</span>
            <p className="file-name">{file.name}</p>
            <button className="change-btn" onClick={handleRemove}>削除</button>
          </div>
        ) : (
          <div className="drop-placeholder">
            <span className="drop-icon">🎬</span>
            <p className="drop-text">動画をドロップ、またはタップして選択</p>
            <p className="drop-hint">mp4 / mov・10秒以内・20MB以内</p>
          </div>
        )}
      </div>
      <textarea
        className="desc-textarea"
        value={desc}
        onChange={e => onDescChange(e.target.value)}
        placeholder="状況を補足（例：ご飯の前、窓の外を眺めて鳴いている）"
        rows={3}
      />
    </div>
  )
}

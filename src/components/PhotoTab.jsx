import { useRef, useState } from 'react'

export default function PhotoTab({ file, onChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  function handleFile(f) {
    if (!f || !/^image\/(jpeg|png|webp)$/.test(f.type)) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
    onChange(f)
  }

  function handleRemove(e) {
    e.stopPropagation()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
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
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      {file ? (
        <div className="drop-preview">
          {previewUrl && <img src={previewUrl} alt="preview" className="preview-img" />}
          <p className="file-name">{file.name}</p>
          <button className="change-btn" onClick={handleRemove}>削除</button>
        </div>
      ) : (
        <div className="drop-placeholder">
          <span className="drop-icon">📷</span>
          <p className="drop-text">写真をドロップ、またはタップして選択</p>
          <p className="drop-hint">jpg / png / webp</p>
        </div>
      )}
    </div>
  )
}

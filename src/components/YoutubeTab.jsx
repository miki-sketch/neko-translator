export default function YoutubeTab({ url, onChange }) {
  const isInvalid = url.trim() && !url.includes('youtube.com/') && !url.includes('youtu.be/')

  return (
    <div className="youtube-tab">
      <div className={`youtube-input-wrap${isInvalid ? ' invalid' : ''}`}>
        <span className="youtube-icon">▶</span>
        <input
          className="youtube-input"
          type="url"
          value={url}
          onChange={e => onChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {url && (
          <button className="youtube-clear" onClick={() => onChange('')} aria-label="クリア">✕</button>
        )}
      </div>
      {isInvalid && <p className="youtube-hint error">YouTube の URL を入力してください</p>}
      {!isInvalid && <p className="youtube-hint">公開動画のみ対応・10秒程度推奨</p>}
    </div>
  )
}

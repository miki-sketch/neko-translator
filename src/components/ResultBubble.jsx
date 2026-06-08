export default function ResultBubble({ result, profile, onReset }) {
  return (
    <div className="result-area">
      {profile?.name && (
        <div className="result-badge">{profile.name}の声 🐾</div>
      )}
      <div className="result-bubble">
        <div className="bubble-label">💬 猫の心の声</div>
        <p className="bubble-voice">「{result.voice}」</p>
      </div>
      {result.reason && (
        <div className="result-reason">
          <div className="reason-label">🔍 翻訳の根拠</div>
          <p className="reason-text">{result.reason}</p>
        </div>
      )}
      <button className="reset-btn" onClick={onReset}>
        ↩ もう一度翻訳する
      </button>
    </div>
  )
}

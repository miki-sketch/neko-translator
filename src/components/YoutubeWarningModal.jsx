export default function YoutubeWarningModal({ onConsent, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-cat">⚠️</div>
        <h2 className="modal-title">YouTube利用の注意</h2>
        <div className="yt-warning-body">
          <p>YouTube URLを直接AIに送信するため、<br />動画全体が解析対象になります。</p>
          <ul className="yt-warning-list">
            <li>長い動画は処理に数分かかる場合があります</li>
            <li>動画の長さに応じてAPIコストが増加します</li>
            <li>短い動画（1〜2分以内）の使用を推奨します</li>
          </ul>
          <p>上記を理解した上で使用しますか？</p>
        </div>
        <div className="modal-actions">
          <button className="modal-btn" onClick={onConsent}>同意して使う</button>
          <button className="modal-btn-secondary" onClick={onCancel}>キャンセル</button>
        </div>
      </div>
    </div>
  )
}

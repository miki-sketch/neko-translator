export default function LoadingCat() {
  return (
    <div className="loading-cat">
      <div className="loading-cat-icon">🐱</div>
      <p className="loading-text">猫語を解析中...</p>
      <div className="loading-dots">
        <span /><span /><span />
      </div>
    </div>
  )
}

export default function TranslateButton({ onClick, disabled }) {
  return (
    <button className="translate-btn" onClick={onClick} disabled={disabled}>
      🐱 猫語を翻訳する
    </button>
  )
}

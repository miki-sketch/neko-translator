const TABS = [
  { id: 'video', label: '動画', icon: '🎬' },
  { id: 'audio', label: '音声', icon: '🎙' },
  { id: 'youtube', label: 'YouTube', icon: '▶' },
]

export default function TabBar({ active, onChange }) {
  return (
    <div className="tab-bar">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`tab-btn${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="tab-icon">{t.icon}</span>
          <span className="tab-label">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

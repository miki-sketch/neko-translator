import { useState } from 'react'
import { setProfile } from '../utils/storage'

const TRAITS = ['甘えん坊', '食いしん坊', 'ツンデレ', 'びびり', 'やんちゃ', '穏やか', 'おしゃべり', 'のんびり']
const AGE_OPTIONS = [
  { value: '', label: '選択なし' },
  { value: 'child', label: '子猫' },
  { value: 'adult', label: '成猫' },
  { value: 'senior', label: 'シニア猫' },
]
const GENDER_OPTIONS = [
  { value: '', label: '選択なし' },
  { value: 'male', label: 'オス' },
  { value: 'female', label: 'メス' },
  { value: 'unknown', label: '不明' },
]

export default function ProfileForm({ profile, onChange }) {
  const [open, setOpen] = useState(false)

  function update(field, value) {
    const next = { ...profile, [field]: value }
    onChange(next)
    setProfile(next)
  }

  function toggleTrait(trait) {
    const traits = profile.traits.includes(trait)
      ? profile.traits.filter(t => t !== trait)
      : [...profile.traits, trait]
    update('traits', traits)
  }

  return (
    <div className="profile-accordion">
      <button className="profile-toggle" onClick={() => setOpen(!open)}>
        <span>🐾 うちの子プロフィール</span>
        <span className={`profile-arrow${open ? ' open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="profile-form">
          <div className="profile-row">
            <label>名前</label>
            <input
              className="profile-input"
              type="text"
              value={profile.name}
              onChange={e => update('name', e.target.value)}
              placeholder="例：こむぎ"
            />
          </div>
          <div className="profile-row two-col">
            <div>
              <label>年齢</label>
              <select className="profile-select" value={profile.age} onChange={e => update('age', e.target.value)}>
                {AGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label>性別</label>
              <select className="profile-select" value={profile.gender} onChange={e => update('gender', e.target.value)}>
                {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="profile-row">
            <label>性格</label>
            <div className="trait-chips">
              {TRAITS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`trait-chip${profile.traits.includes(t) ? ' active' : ''}`}
                  onClick={() => toggleTrait(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="profile-row">
            <label>備考</label>
            <textarea
              className="profile-textarea"
              value={profile.memo}
              onChange={e => update('memo', e.target.value)}
              placeholder="自由に入力（病気、嫌いなもの、最近の様子など）"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  )
}

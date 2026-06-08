import { useState } from 'react'
import { getApiKey, getProfile } from './utils/storage'
import { useGemini } from './hooks/useGemini'
import ApiKeySetup from './components/ApiKeySetup'
import TabBar from './components/TabBar'
import VideoTab from './components/VideoTab'
import AudioTab from './components/AudioTab'
import YoutubeTab from './components/YoutubeTab'
import ProfileForm from './components/ProfileForm'
import TranslateButton from './components/TranslateButton'
import ResultBubble from './components/ResultBubble'
import LoadingCat from './components/LoadingCat'

function normalizeMimeType(file) {
  const type = file.type || ''
  const ext = file.name.split('.').pop().toLowerCase()
  const overrides = {
    'video/quicktime': 'video/mp4',
    'audio/x-m4a': 'audio/mp4',
    'audio/mp3': 'audio/mpeg',
  }
  if (overrides[type]) return overrides[type]
  if (type) return type
  const extMap = {
    mp4: 'video/mp4', mov: 'video/mp4',
    mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav',
  }
  return extMap[ext] || ''
}

export default function App() {
  const [showApiModal, setShowApiModal] = useState(!getApiKey())
  const [activeTab, setActiveTab] = useState('video')
  const [profile, setProfile] = useState(getProfile())

  const [videoFile, setVideoFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [videoDesc, setVideoDesc] = useState('')
  const [audioDesc, setAudioDesc] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [tabError, setTabError] = useState(null)

  const { loading, result, error, translate, reset } = useGemini()

  function handleTabChange(tab) {
    setActiveTab(tab)
    setTabError(null)
    reset()
  }

  function handleTranslate() {
    if (activeTab === 'video' && videoFile) {
      translate('video', { file: videoFile, mimeType: normalizeMimeType(videoFile), descText: videoDesc }, profile)
    } else if (activeTab === 'audio' && audioFile) {
      translate('audio', { file: audioFile, mimeType: normalizeMimeType(audioFile), descText: audioDesc }, profile)
    } else if (activeTab === 'youtube' && youtubeUrl.trim()) {
      translate('youtube', { youtubeUrl: youtubeUrl.trim() }, profile)
    }
  }

  function canTranslate() {
    if (loading || tabError) return false
    if (activeTab === 'video') return !!videoFile
    if (activeTab === 'audio') return !!audioFile
    if (activeTab === 'youtube') {
      const u = youtubeUrl.trim()
      return !!u && (u.includes('youtube.com/') || u.includes('youtu.be/'))
    }
    return false
  }

  const showModal = showApiModal || error === 'API_KEY_MISSING'
  const displayError = tabError || (error && error !== 'API_KEY_MISSING' ? error : null)

  return (
    <>
      {showModal && (
        <ApiKeySetup onSave={() => { setShowApiModal(false); reset() }} />
      )}
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <h1 className="app-title">🐱 猫語翻訳機</h1>
            <button className="settings-btn" onClick={() => setShowApiModal(true)} title="APIキー設定">⚙</button>
          </div>
        </header>

        <ProfileForm profile={profile} onChange={setProfile} />

        <TabBar active={activeTab} onChange={handleTabChange} />

        {loading ? (
          <LoadingCat />
        ) : result ? (
          <ResultBubble result={result} profile={profile} onReset={reset} />
        ) : (
          <div className="input-area">
            {activeTab === 'video' && (
              <VideoTab
                file={videoFile}
                onChange={setVideoFile}
                desc={videoDesc}
                onDescChange={setVideoDesc}
                onError={setTabError}
              />
            )}
            {activeTab === 'audio' && (
              <AudioTab
                file={audioFile}
                onChange={setAudioFile}
                desc={audioDesc}
                onDescChange={setAudioDesc}
                onError={setTabError}
              />
            )}
            {activeTab === 'youtube' && (
              <YoutubeTab url={youtubeUrl} onChange={setYoutubeUrl} />
            )}

            {displayError && <p className="error-msg">{displayError}</p>}

            <TranslateButton onClick={handleTranslate} disabled={!canTranslate()} />

            <p className="privacy-notice">📤 アップロードされたファイルはGemini APIに送信されます</p>
          </div>
        )}
      </div>
    </>
  )
}

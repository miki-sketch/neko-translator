import { useState } from 'react'
import { getApiKey, getProfile } from './utils/storage'
import { useGemini } from './hooks/useGemini'
import ApiKeySetup from './components/ApiKeySetup'
import TabBar from './components/TabBar'
import VideoTab from './components/VideoTab'
import AudioTab from './components/AudioTab'
import YoutubeTab from './components/YoutubeTab'
import YoutubeWarningModal from './components/YoutubeWarningModal'
import ProfileForm from './components/ProfileForm'
import TranslateButton from './components/TranslateButton'
import ResultBubble from './components/ResultBubble'
import LoadingCat from './components/LoadingCat'

export default function App() {
  const [showApiModal, setShowApiModal] = useState(!getApiKey())
  const [activeTab, setActiveTab] = useState('video')
  const [profile, setProfile] = useState(getProfile())

  const [videoDesc, setVideoDesc] = useState('')
  const [audioDesc, setAudioDesc] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [tabError, setTabError] = useState(null)

  const [showYoutubeWarning, setShowYoutubeWarning] = useState(false)
  const [youtubeConsented, setYoutubeConsented] = useState(false)

  const { loading, result, error, translate, reset } = useGemini()

  function handleTabChange(tab) {
    setActiveTab(tab)
    setTabError(null)
    reset()
    if (tab === 'youtube' && !youtubeConsented) {
      setShowYoutubeWarning(true)
    }
  }

  function handleYoutubeConsent() {
    setYoutubeConsented(true)
    setShowYoutubeWarning(false)
  }

  function handleYoutubeCancel() {
    setShowYoutubeWarning(false)
    setActiveTab('video')
  }

  function handleYoutubeTranslate() {
    const u = youtubeUrl.trim()
    if (u) translate('youtube', { youtubeUrl: u }, profile)
  }

  function canTranslateYoutube() {
    if (loading) return false
    const u = youtubeUrl.trim()
    return !!u && (u.includes('youtube.com/') || u.includes('youtu.be/'))
  }

  const showModal = showApiModal || error === 'API_KEY_MISSING'
  const displayError = tabError || (error && error !== 'API_KEY_MISSING' ? error : null)

  return (
    <>
      {showModal && (
        <ApiKeySetup onSave={() => { setShowApiModal(false); reset() }} />
      )}
      {showYoutubeWarning && (
        <YoutubeWarningModal onConsent={handleYoutubeConsent} onCancel={handleYoutubeCancel} />
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
                onReady={(blob, seconds) => translate('video', { blob, recordedSeconds: seconds, descText: videoDesc }, profile)}
                desc={videoDesc}
                onDescChange={setVideoDesc}
                onError={setTabError}
              />
            )}
            {activeTab === 'audio' && (
              <AudioTab
                onReady={(blob, seconds) => translate('audio', { blob, recordedSeconds: seconds, descText: audioDesc }, profile)}
                desc={audioDesc}
                onDescChange={setAudioDesc}
                onError={setTabError}
              />
            )}
            {activeTab === 'youtube' && (
              <YoutubeTab url={youtubeUrl} onChange={setYoutubeUrl} />
            )}

            {displayError && <p className="error-msg">{displayError}</p>}

            {activeTab === 'youtube' && (
              <TranslateButton onClick={handleYoutubeTranslate} disabled={!canTranslateYoutube()} />
            )}

            <p className="privacy-notice">📤 アップロードされたファイルはGemini APIに送信されます</p>
          </div>
        )}
      </div>
    </>
  )
}

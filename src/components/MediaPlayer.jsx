import { useRef, useState, useEffect } from 'react'

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// status: 'idle' | 'recording' | 'processing'
export default function MediaPlayer({ mediaType, onReady, desc, onDescChange, onError, resetSignal }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [mediaKey, setMediaKey] = useState(0)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const mediaRef = useRef(null)
  const seekbarRef = useRef(null)
  const audioCtxRef = useRef(null)
  const audioSourceRef = useRef(null)
  const captureStreamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const startTimeRef = useRef(null)
  const startMediaTimeRef = useRef(null)
  const inputRef = useRef(null)

  // Update seekbar value and CSS fill variable directly (iOS fix)
  function syncSeekbar(time) {
    if (!seekbarRef.current) return
    seekbarRef.current.value = time
    const d = mediaRef.current?.duration || 0
    if (d > 0) {
      seekbarRef.current.style.setProperty('--seek-value', `${(time / d) * 100}%`)
    }
  }

  // Register timeupdate via addEventListener for reliable iOS firing
  useEffect(() => {
    const media = mediaRef.current
    if (!media) return
    const onTimeUpdate = () => {
      const t = media.currentTime
      const d = media.duration
      if (seekbarRef.current) {
        seekbarRef.current.value = t
        if (d > 0) seekbarRef.current.style.setProperty('--seek-value', `${(t / d) * 100}%`)
      }
      setCurrentTime(t)
    }
    media.addEventListener('timeupdate', onTimeUpdate)
    return () => media.removeEventListener('timeupdate', onTimeUpdate)
  }, [mediaKey])

  useEffect(() => {
    if (resetSignal > 0) {
      setStatus('idle')
      setMessage('')
      const t = startMediaTimeRef.current
      if (t != null && mediaRef.current) {
        mediaRef.current.currentTime = t
        syncSeekbar(t)
        setCurrentTime(t)
      }
    }
  }, [resetSignal])

  function cleanup() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
      audioSourceRef.current = null
      captureStreamRef.current = null
    }
  }

  function setupAudioContext() {
    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaElementSource(mediaRef.current)
    const destination = audioCtx.createMediaStreamDestination()
    source.connect(destination)
    source.connect(audioCtx.destination)
    audioCtxRef.current = audioCtx
    audioSourceRef.current = source
    captureStreamRef.current = destination.stream
  }

  function handleFile(f) {
    if (!f) return
    cleanup()
    const url = URL.createObjectURL(f)
    setFile(f)
    setPreviewUrl(url)
    setMediaKey(k => k + 1)
    setStatus('idle')
    setMessage('')
    setCurrentTime(0)
    setDuration(0)
    startMediaTimeRef.current = null
    if (seekbarRef.current) {
      seekbarRef.current.value = 0
      seekbarRef.current.style.setProperty('--seek-value', '0%')
    }
  }

  async function handleStart() {
    const media = mediaRef.current
    if (!media) return

    media.muted = false

    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        setupAudioContext()
      }
      await audioCtxRef.current.resume()
    } catch {
      onError?.('音声の取得に失敗しました。ブラウザの設定を確認してください。')
      return
    }

    try {
      await media.play()
    } catch {
      onError?.('再生に失敗しました。')
      return
    }

    chunksRef.current = []
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
    const recorder = new MediaRecorder(captureStreamRef.current, mimeType ? { mimeType } : {})
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorderRef.current = recorder
    recorder.start()

    startTimeRef.current = Date.now()
    startMediaTimeRef.current = media.currentTime

    setStatus('recording')
    setMessage('🐱 翻訳開始だにゃ〜！')
  }

  function handleEnd() {
    const media = mediaRef.current
    const endMediaTime = media?.currentTime ?? 0
    media?.pause()

    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return

    recorder.onstop = () => {
      const type = recorder.mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type })
      const secs = Math.round((Date.now() - startTimeRef.current) / 1000)
      setMessage(`😸 ${secs}秒間、翻訳します！`)
      setStatus('processing')
      onReady(blob, secs, startMediaTimeRef.current ?? 0, endMediaTime)
    }
    recorder.stop()
  }

  function handleStop() {
    const media = mediaRef.current
    media?.pause()

    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.ondataavailable = null
      recorder.onstop = null
      recorder.stop()
    }
    recorderRef.current = null
    chunksRef.current = []

    const resetTime = startMediaTimeRef.current ?? 0
    if (media) media.currentTime = resetTime
    syncSeekbar(resetTime)
    setCurrentTime(resetTime)

    setStatus('idle')
    setMessage('🔄 やりなおすんだにゃ')
  }

  function handleSeek(e) {
    const t = Number(e.target.value)
    if (mediaRef.current) mediaRef.current.currentTime = t
    syncSeekbar(t)
    setCurrentTime(t)
  }

  const accept = mediaType === 'video'
    ? 'video/mp4,video/quicktime,.mp4,.mov'
    : 'audio/mpeg,audio/mp4,audio/wav,audio/x-m4a,.mp3,.m4a,.wav'

  const icon = mediaType === 'video' ? '🎬' : '🎙'

  const isRecording = status === 'recording'
  const isProcessing = status === 'processing'
  const seekDisabled = isRecording || isProcessing

  const mediaEvents = {
    onLoadedMetadata: () => { if (mediaRef.current) setDuration(mediaRef.current.duration || 0) },
    onEnded: () => { if (isRecording) handleEnd() },
  }

  return (
    <div className="media-player">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {!file ? (
        <div className="drop-zone" onClick={() => inputRef.current?.click()}>
          <div className="drop-placeholder">
            <span className="drop-icon">{icon}</span>
            <p className="drop-text">タップしてファイルを選択</p>
            <p className="drop-hint">{mediaType === 'video' ? 'mp4 / mov' : 'mp3 / m4a / wav'}</p>
          </div>
        </div>
      ) : (
        <div className="player-area">
          {mediaType === 'video' && (
            <video key={mediaKey} ref={mediaRef} src={previewUrl} className="player-video" playsInline {...mediaEvents} />
          )}
          {mediaType === 'audio' && (
            <>
              <audio key={mediaKey} ref={mediaRef} src={previewUrl} {...mediaEvents} />
              <div className="audio-visual">
                <span className="audio-icon">🎵</span>
              </div>
            </>
          )}

          <input
            type="range"
            ref={seekbarRef}
            min={0}
            max={duration || 0}
            step={0.1}
            defaultValue={0}
            onChange={handleSeek}
            disabled={seekDisabled}
            className="seek-bar"
            style={seekDisabled ? { opacity: 0.4 } : undefined}
          />
          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <p className="player-filename">{file.name}</p>

          {message && <p className="player-message">{message}</p>}

          <div className="player-controls">
            <button
              className="player-btn translate-start-btn"
              onClick={handleStart}
              disabled={isRecording || isProcessing}
            >
              翻訳開始
            </button>
            <button
              className="player-btn translate-end-btn"
              onClick={handleEnd}
              disabled={!isRecording}
            >
              翻訳終了
            </button>
            <button
              className="player-btn translate-stop-btn"
              onClick={handleStop}
              disabled={!isRecording}
            >
              STOP
            </button>
          </div>
        </div>
      )}

      <textarea
        className="desc-textarea"
        value={desc}
        onChange={e => onDescChange(e.target.value)}
        placeholder={
          mediaType === 'video'
            ? '状況を補足（例：ご飯の前、窓の外を眺めて鳴いている）'
            : '状況を補足（例：朝起きた直後、空腹時に鳴いている）'
        }
        rows={3}
      />
    </div>
  )
}

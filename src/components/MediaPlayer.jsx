import { useRef, useState } from 'react'

export default function MediaPlayer({ mediaType, onReady, desc, onDescChange, onError }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [recordedSeconds, setRecordedSeconds] = useState(0)

  const mediaRef = useRef(null)
  const audioCtxRef = useRef(null)
  const destRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const startTimeRef = useRef(null)
  const inputRef = useRef(null)

  function cleanup() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
      destRef.current = null
    }
  }

  function handleFile(f) {
    if (!f) return
    cleanup()
    const url = URL.createObjectURL(f)
    setFile(f)
    setPreviewUrl(url)
    setCapturedBlob(null)
    setIsPlaying(false)
    setIsRecording(false)
  }

  function handleRemove(e) {
    e.stopPropagation()
    cleanup()
    setFile(null)
    setPreviewUrl(null)
    setCapturedBlob(null)
    setIsPlaying(false)
    setIsRecording(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handlePlay() {
    const media = mediaRef.current
    if (!media) return

    if (!audioCtxRef.current) {
      try {
        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaElementSource(media)
        const dest = audioCtx.createMediaStreamDestination()
        source.connect(dest)
        source.connect(audioCtx.destination)
        audioCtxRef.current = audioCtx
        destRef.current = dest
      } catch {
        onError?.('音声の取得に失敗しました。ブラウザの設定を確認してください。')
        return
      }
    }

    try {
      await audioCtxRef.current.resume()
      await media.play()
      setIsPlaying(true)
    } catch {
      onError?.('再生に失敗しました。')
    }
  }

  function handlePause() {
    mediaRef.current?.pause()
    setIsPlaying(false)
  }

  function startRecording() {
    if (!destRef.current) return
    chunksRef.current = []

    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
    const recorder = new MediaRecorder(destRef.current.stream, mimeType ? { mimeType } : {})

    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const type = recorder.mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type })
      const secs = Math.round((Date.now() - startTimeRef.current) / 1000)
      setCapturedBlob(blob)
      setRecordedSeconds(secs)
    }

    recorderRef.current = recorder
    recorder.start()
    startTimeRef.current = Date.now()
    setIsRecording(true)
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setIsRecording(false)
  }

  function handleReset() {
    setCapturedBlob(null)
    setIsPlaying(false)
    if (mediaRef.current) {
      mediaRef.current.pause()
      mediaRef.current.currentTime = 0
    }
  }

  const accept = mediaType === 'video'
    ? 'video/mp4,video/quicktime,.mp4,.mov'
    : 'audio/mpeg,audio/mp4,audio/wav,audio/x-m4a,.mp3,.m4a,.wav'

  const icon = mediaType === 'video' ? '🎬' : '🎙'

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
            <video
              ref={mediaRef}
              src={previewUrl}
              className="player-video"
              onEnded={() => setIsPlaying(false)}
              playsInline
            />
          )}
          {mediaType === 'audio' && (
            <>
              <audio ref={mediaRef} src={previewUrl} onEnded={() => setIsPlaying(false)} />
              <div className="audio-visual">
                <span className="audio-icon">🎵</span>
              </div>
            </>
          )}

          <p className="player-filename">{file.name}</p>

          {!capturedBlob && !isRecording && (
            <div className="player-controls">
              <button className="player-btn play-btn" onClick={isPlaying ? handlePause : handlePlay}>
                {isPlaying ? '⏸ 一時停止' : '▶ 再生'}
              </button>
              <button className="player-btn record-btn" onClick={startRecording} disabled={!isPlaying}>
                🔴 録音開始
              </button>
            </div>
          )}

          {isRecording && (
            <div className="player-controls">
              <button className="player-btn record-stop-btn" onClick={stopRecording}>
                ⏹ 録音停止
              </button>
            </div>
          )}

          {capturedBlob && !isRecording && (
            <div className="capture-ready">
              <p className="capture-info">✅ {recordedSeconds}秒間を録音しました</p>
              <button className="translate-capture-btn" onClick={() => onReady(capturedBlob, recordedSeconds)}>
                🐱 この内容で翻訳する
              </button>
              <button className="player-btn retry-btn" onClick={handleReset}>やり直す</button>
            </div>
          )}

          {!isRecording && !capturedBlob && (
            <button className="file-remove-btn" onClick={handleRemove}>削除</button>
          )}
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

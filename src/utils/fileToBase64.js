export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsDataURL(file)
  })
}

export function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const el = document.createElement('video')
    el.preload = 'metadata'
    el.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(el.duration) }
    el.onerror = () => { URL.revokeObjectURL(url); reject(new Error('動画の読み込みに失敗しました')) }
    el.src = url
  })
}

export async function videoToBase64Trimmed(file, seconds) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const chunks = []

    video.src = URL.createObjectURL(file)
    video.muted = true

    video.onloadedmetadata = () => {
      const duration = Math.min(seconds, video.duration)

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const stream = canvas.captureStream(30)

      try {
        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaElementSource(video)
        const dest = audioCtx.createMediaStreamDestination()
        source.connect(dest)
        dest.stream.getAudioTracks().forEach(t => stream.addTrack(t))
      } catch {
        // 音声キャプチャ非対応環境でも続行
      }

      const mimeType = 'video/webm'
      const recorder = new MediaRecorder(stream, { mimeType })

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = () => {
        URL.revokeObjectURL(video.src)
        const blob = new Blob(chunks, { type: mimeType })
        const reader = new FileReader()
        reader.onload = ev => resolve({
          base64: ev.target.result.split(',')[1],
          mimeType,
          actualSeconds: Math.round(duration)
        })
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }

      function drawFrame() {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0)
          requestAnimationFrame(drawFrame)
        }
      }

      recorder.start()
      video.play()
        .then(() => drawFrame())
        .catch(reject)

      setTimeout(() => {
        recorder.stop()
        video.pause()
      }, duration * 1000)
    }

    video.onerror = () => reject(new Error('動画の読み込みに失敗しました'))
  })
}

export function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const el = document.createElement('audio')
    el.preload = 'metadata'
    el.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(el.duration) }
    el.onerror = () => { URL.revokeObjectURL(url); reject(new Error('音声ファイルの読み込みに失敗しました')) }
    el.src = url
  })
}

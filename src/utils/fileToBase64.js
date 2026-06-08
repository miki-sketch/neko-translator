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

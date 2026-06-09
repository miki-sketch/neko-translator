import MediaPlayer from './MediaPlayer'

export default function AudioTab({ onReady, desc, onDescChange, onError, resetSignal }) {
  return (
    <MediaPlayer
      mediaType="audio"
      onReady={onReady}
      desc={desc}
      onDescChange={onDescChange}
      onError={onError}
      resetSignal={resetSignal}
    />
  )
}

import MediaPlayer from './MediaPlayer'

export default function AudioTab({ onReady, desc, onDescChange, onError }) {
  return (
    <MediaPlayer
      mediaType="audio"
      onReady={onReady}
      desc={desc}
      onDescChange={onDescChange}
      onError={onError}
    />
  )
}

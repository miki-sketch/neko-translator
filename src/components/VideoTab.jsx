import MediaPlayer from './MediaPlayer'

export default function VideoTab({ onReady, desc, onDescChange, onError }) {
  return (
    <MediaPlayer
      mediaType="video"
      onReady={onReady}
      desc={desc}
      onDescChange={onDescChange}
      onError={onError}
    />
  )
}

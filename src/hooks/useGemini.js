import { useState } from 'react'
import { getApiKey, isBuiltinMode } from '../utils/storage'
import { blobToBase64 } from '../utils/fileToBase64'
import { buildPrompt } from '../utils/buildPrompt'

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

function parseResult(text) {
  const sections = text.split(/(?=【[^】]+】)/)
  let voice = '', reason = ''
  for (const s of sections) {
    if (s.startsWith('【猫の心の声】')) {
      voice = s.replace('【猫の心の声】', '').trim().replace(/^「|」$/g, '').trim()
    } else if (s.startsWith('【翻訳の根拠】')) {
      reason = s.replace('【翻訳の根拠】', '').trim()
    }
  }
  return voice ? { voice, reason } : null
}

function fmtMediaTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function useGemini() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function translate(inputType, { blob, recordedSeconds, startMediaTime, endMediaTime, youtubeUrl, descText }, profile) {
    setLoading(true)
    setError(null)
    setResult(null)

    let apiKey
    if (isBuiltinMode()) {
      const password = localStorage.getItem('builtin_password')
      if (password !== import.meta.env.VITE_SHARED_PASSWORD) {
        setError('パスワードが違うにゃ🔐 もう一度確認してみてね！')
        setLoading(false)
        return
      }
      apiKey = import.meta.env.VITE_SHARED_API_KEY
    } else {
      apiKey = getApiKey()
    }

    if (!apiKey) {
      setError('API_KEY_MISSING')
      setLoading(false)
      return
    }

    try {
      const promptText = buildPrompt(profile) + (descText ? `\n\n【状況】\n${descText}` : '')
      let parts
      let analyzedDuration = null

      if (inputType === 'youtube') {
        parts = [
          { file_data: { file_uri: youtubeUrl } },
          { text: promptText }
        ]
      } else {
        console.log('blob size:', blob.size, 'mime:', blob.type)
        const data = await blobToBase64(blob)
        console.log('base64 length:', data.length)
        parts = [
          { inline_data: { mime_type: blob.type || 'audio/webm', data } },
          { text: promptText }
        ]
        const dur = Math.round(endMediaTime - startMediaTime)
        analyzedDuration = `${fmtMediaTime(startMediaTime)}〜${fmtMediaTime(endMediaTime)}（${dur}秒間）`
      }

      const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: 2048 }
        })
      })

      const json = await res.json()
      console.log('Gemini API response status:', res.status)
      console.log('Gemini API response body:', JSON.stringify(json, null, 2))

      if (!res.ok) {
        const msg = (json.error?.message || '').toLowerCase()
        if (res.status === 401 || (res.status === 400 && msg.includes('api key'))) {
          throw new Error('APIキーが違うみたいにゃ🔑 右上の⚙️から確認してみてね！')
        }
        throw new Error('にゃ？うまく繋がらなかったみたい😿 もう一度試してみてにゃ〜')
      }

      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const parsed = parseResult(text)

      if (!parsed) {
        throw new Error('うーん、猫ちゃんの声が聞き取れなかったにゃ…🐱 別の動画や音声で試してみてね！')
      }

      setResult({ ...parsed, analyzedDuration })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  return { loading, result, error, translate, reset }
}

const GAS_URL = import.meta.env.VITE_LOG_GAS_URL
console.log('GAS_URL:', import.meta.env.VITE_LOG_GAS_URL)

export async function sendLog({ tab, apiType, result, error = '' }) {
  if (!GAS_URL) return

  try {
    console.log('ログ送信開始', { tab, apiType, result, error })
    await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      redirect: 'follow',
      body: JSON.stringify({ tab, apiType, result, error })
    })
    console.log('ログ送信完了')
  } catch (e) {
    console.error('ログ送信失敗:', e.message)
  }
}

const GAS_URL = import.meta.env.VITE_LOG_GAS_URL

export async function sendLog({ tab, apiType, result, error = '' }) {
  if (!GAS_URL) return

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      redirect: 'follow',
      body: JSON.stringify({ tab, apiType, result, error })
    })
  } catch {
  }
}

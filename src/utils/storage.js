export const getApiKey = () => localStorage.getItem('gemini_api_key') || ''
export const setApiKey = (key) => localStorage.setItem('gemini_api_key', key)

export const getProfile = () => {
  try {
    const raw = localStorage.getItem('neko_profile')
    return raw ? JSON.parse(raw) : emptyProfile()
  } catch {
    return emptyProfile()
  }
}
export const setProfile = (p) => localStorage.setItem('neko_profile', JSON.stringify(p))

const emptyProfile = () => ({ name: '', age: '', gender: '', traits: [], memo: '' })

export function saveBuiltinMode(password) {
  localStorage.setItem('use_builtin', 'true')
  localStorage.setItem('builtin_password', password)
}

export function clearBuiltinMode() {
  localStorage.removeItem('use_builtin')
  localStorage.removeItem('builtin_password')
}

export function isBuiltinMode() {
  return localStorage.getItem('use_builtin') === 'true'
}

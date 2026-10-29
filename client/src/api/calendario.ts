export function dataLocal(agora = new Date()) {
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
}
export function fusoLocal() { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' }

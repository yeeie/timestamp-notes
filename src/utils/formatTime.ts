export function formatTime(ms: number): string {
  const totalMs = Math.max(0, Math.floor(ms))
  const centis = Math.floor((totalMs % 1000) / 10)
  let totalSec = Math.floor(totalMs / 1000)
  const ss = totalSec % 60
  const mm = Math.floor((totalSec % 3600) / 60)
  const hh = Math.floor(totalSec / 3600)
  const pad = (n: number, l = 2) => String(n).padStart(l, '0')
  if (hh > 0) {
    return `${pad(hh)}:${pad(mm)}:${pad(ss)}.${pad(centis)}`
  }
  return `${pad(mm)}:${pad(ss)}.${pad(centis)}`
}

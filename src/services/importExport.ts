import { Session } from '../types'

export function downloadJson(session: Session) {
  const blob = new Blob([JSON.stringify({ version: 1, ...session }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${session.title || 'session'}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function readJsonFile(file: File): Promise<Session> {
  const text = await file.text()
  const parsed = JSON.parse(text)
  // basic validation
  if (!parsed || typeof parsed !== 'object') throw new Error('无效 JSON')
  if (!parsed.title || !Array.isArray(parsed.notes)) throw new Error('格式不符合：缺少 title 或 notes')
  // ensure notes have required fields
  parsed.notes.forEach((n: any, idx: number) => {
    if (typeof n.timestampMs !== 'number') throw new Error(`notes[${idx}].timestampMs 必须为数字`)
    if (typeof n.note !== 'string') n.note = String(n.note ?? '')
  })
  return parsed as Session
}

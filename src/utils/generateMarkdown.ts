import { Session } from '../types'
import { formatTime } from './formatTime'
import { pathToFileUri } from './pathToFileUri'

export function generateMarkdown(session: Session, mediaUrl?: string) {
  const uri = mediaUrl ? pathToFileUri(mediaUrl) : ''
  const lines: string[] = []
  session.notes.sort((a, b) => a.timestampMs - b.timestampMs).forEach((n) => {
    const ts = formatTime(n.timestampMs)
    if (uri) lines.push(`[${ts}](${uri}#t=${ts})`)
    else lines.push(`[${ts}](#t=${ts})`)
    lines.push('')
    lines.push(n.note || '')
    lines.push('')
  })
  return lines.join('\n')
}

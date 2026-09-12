import React, { useState } from 'react'
import { TimestampNote } from '../types'
import { formatTime } from '../utils/formatTime'

type Props = {
  note: TimestampNote
  onChange: (id: string, fields: Partial<TimestampNote>) => void
  onDelete: (id: string) => void
  onCtrlEnterNext: (currentId: string) => void
  selected?: boolean
  onToggleSelect?: (id: string, next: boolean) => void
}

export default function NoteItem({ note, onChange, onDelete, onCtrlEnterNext, selected, onToggleSelect }: Props) {
  const [editingTime, setEditingTime] = useState(false)
  const [timeInput, setTimeInput] = useState(formatTime(note.timestampMs))
  // selection is controlled by parent when provided
  const [internalSelected, setInternalSelected] = useState(false)
  const sel = typeof selected === 'boolean' ? selected : internalSelected
  return (
    <div className="note-card" data-note-id={note.id}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <input type="checkbox" className="note-select" checked={sel} onChange={(e) => {
          const v = e.target.checked
          if (onToggleSelect) onToggleSelect(note.id, v)
          else setInternalSelected(v)
        }} />
        <div className="note-time">{formatTime(note.timestampMs)}</div>
      </div>
      <textarea
        value={note.note}
        onChange={(e) => onChange(note.id, { note: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            onCtrlEnterNext(note.id)
          }
        }}
      />
      <div className="note-actions">
        {!editingTime ? (
          <button className="btn btn-ghost btn-sm" onClick={() => { setTimeInput(formatTime(note.timestampMs)); setEditingTime(true) }}>修改时间</button>
        ) : (
          <span>
            <input value={timeInput} onChange={(e) => setTimeInput(e.target.value)} style={{width:120}} />
            <button className="btn btn-primary btn-sm" onClick={() => {
              const ms = parseTimeToMs(timeInput)
              if (ms == null) return alert('时间格式无效')
              onChange(note.id, { timestampMs: ms })
              setEditingTime(false)
            }}>保存</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditingTime(false)}>取消</button>
          </span>
        )}
        <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('删除该记录?')) onDelete(note.id) }}>删除</button>
      </div>
    </div>
  )
}

function parseTimeToMs(t: string): number | null {
  const parts = t.split(':')
  if (parts.length === 2) {
    const mm = parseInt(parts[0])
    const [ssStr, ccStr] = parts[1].split('.')
    const ss = parseInt(ssStr)
    const cc = parseInt((ccStr || '0').padEnd(2, '0'))
    if (Number.isNaN(mm) || Number.isNaN(ss) || Number.isNaN(cc)) return null
    return ((mm * 60) + ss) * 1000 + Math.round(cc * 10)
  }
  if (parts.length === 3) {
    const hh = parseInt(parts[0])
    const mm = parseInt(parts[1])
    const [ssStr, ccStr] = parts[2].split('.')
    const ss = parseInt(ssStr)
    const cc = parseInt((ccStr || '0').padEnd(2, '0'))
    if (Number.isNaN(hh) || Number.isNaN(mm) || Number.isNaN(ss) || Number.isNaN(cc)) return null
    return ((hh * 3600) + (mm * 60) + ss) * 1000 + Math.round(cc * 10)
  }
  return null
}

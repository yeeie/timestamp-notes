import React from 'react'
import { TimestampNote } from '../types'
import NoteItem from './NoteItem'

type Props = {
  notes: TimestampNote[]
  onChange: (id: string, fields: Partial<TimestampNote>) => void
  onDelete: (id: string) => void
  onCtrlEnterNext: (currentId: string) => void
  selectedIds?: string[]
  onToggleSelect?: (id: string, next: boolean) => void
}

export default function NoteList({ notes, onChange, onDelete, onCtrlEnterNext, selectedIds, onToggleSelect }: Props) {
  return (
    <div>
      {notes.map((n) => (
        <NoteItem key={n.id} note={n} onChange={onChange} onDelete={onDelete} onCtrlEnterNext={onCtrlEnterNext} selected={selectedIds?.includes(n.id)} onToggleSelect={onToggleSelect} />
      ))}
    </div>
  )
}

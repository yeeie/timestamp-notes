import React from 'react'
import { Session } from '../types'

type Props = {
  sessions: Session[]
  currentId: string | null
  onCreate: () => void | Promise<string>
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function Sidebar({ sessions, currentId, onCreate, onSelect, onDelete }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="btn btn-primary btn-sm" onClick={onCreate}>+ 新建项目</button>
      </div>
      <div className="session-list">
        {sessions.map((s) => (
          <div key={s.id} className={`session-item ${s.id === currentId ? 'active' : ''}`} onClick={() => onSelect(s.id)}>
            <div className="title">{s.title}</div>
            <div className="meta">{new Date(s.updatedAt).toLocaleString()}</div>
            <button className="del btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}>删除</button>
          </div>
        ))}
      </div>
    </aside>
  )
}

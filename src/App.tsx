import React, { useEffect, useRef, useState } from 'react'
import { useTimer } from './hooks/useTimer'
import { formatTime } from './utils/formatTime'
import { Storage } from './services/storage'
import { v4 as uuidv4 } from 'uuid'
import './styles.css'
import Sidebar from './components/Sidebar'
import NoteList from './components/NoteList'
import { Session, TimestampNote } from './types'
import * as importExport from './services/importExport'
import { generateMarkdown } from './utils/generateMarkdown'

const storage = new Storage()

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [mediaUrl, setMediaUrl] = useState('')
  const [titleInput, setTitleInput] = useState('')
  const [showSetTime, setShowSetTime] = useState(false)
  const [setTimeInput, setSetTimeInput] = useState('')
  const [offsetInput, setOffsetInput] = useState('00:00.00')
  const { timeMs, running, start, pause, reset, setTimeMs } = useTimer()
  const listRef = useRef<HTMLDivElement | null>(null)

  const handleStart = async () => {
    if (!currentId) {
      await createSession()
    }
    start()
  }
  useEffect(() => {
    ;(async () => {
      const s = await storage.getAllSessions()
      setSessions(s)
      if (s.length) setCurrentId(s[0].id)
    })()
  }, [])

  useEffect(() => {
    // sync title & media input when current session changes
    const cur = sessions.find((s) => s.id === currentId) || null
    setTitleInput(cur?.title ?? '')
    setMediaUrl(cur?.media ?? '')
  }, [currentId, sessions])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null
      const inInput = active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')
      if (e.code === 'Space' && !inInput) {
        e.preventDefault()
        running ? pause() : handleStart()
      }
      if (e.key.toLowerCase() === 'r' && !inInput) {
        e.preventDefault()
        handleRecord()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, timeMs, currentId, sessions])

  const current = sessions.find((s) => s.id === currentId) || null

  const updateSessionTitle = async (newTitle: string) => {
    if (!current) return
    const next = sessions.map((s) => s.id === current.id ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s)
    await saveSessions(next)
  }

  const updateSessionMedia = async (newMedia: string) => {
    if (!current) return
    const next = sessions.map((s) => s.id === current.id ? { ...s, media: newMedia, updatedAt: new Date().toISOString() } : s)
    await saveSessions(next)
  }

  const saveSessions = async (next: Session[]) => {
    setSessions(next)
    // debounce actual DB writes to avoid frequent writes during typing
    schedulePersist(next)
  }

  const createSession = async () => {
    const s: Session = { id: uuidv4(), title: '新项目', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), notes: [] }
    const next = [s, ...sessions]
    await saveSessions(next)
    setCurrentId(s.id)
  }

  const deleteSession = async (id: string) => {
    const next = sessions.filter((x) => x.id !== id)
    await saveSessions(next)
    if (currentId === id) setCurrentId(next[0]?.id ?? null)
  }

  const handleRecord = async () => {
    if (!currentId) return
    const note: TimestampNote = {
      id: uuidv4(),
      timestampMs: Math.max(0, Math.floor(timeMs)),
      note: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const next = sessions.map((s) => (s.id === currentId ? { ...s, notes: [...s.notes, note].sort((a, b) => a.timestampMs - b.timestampMs), updatedAt: new Date().toISOString() } : s))
    await saveSessions(next)
    setTimeout(() => {
      const el = document.querySelector(`[data-note-id="${note.id}"] textarea`) as HTMLTextAreaElement | null
      el?.focus()
    }, 50)
  }

  const toggleSelect = (id: string, next: boolean) => {
    setSelectedIds((prev) => {
      if (next) return Array.from(new Set([...prev, id]))
      return prev.filter(x => x !== id)
    })
  }

  const applyOffsetToSelected = async (offsetMs: number, increase = true) => {
    if (!current) return
    const next = sessions.map((s) => {
      if (s.id !== current.id) return s
      const notes = s.notes.map(n => {
        if (!selectedIds.includes(n.id)) return n
        const newTs = Math.max(0, n.timestampMs + (increase ? offsetMs : -offsetMs))
        return { ...n, timestampMs: newTs, updatedAt: new Date().toISOString() }
      }).sort((a,b)=>a.timestampMs - b.timestampMs)
      return { ...s, notes, updatedAt: new Date().toISOString() }
    })
    await saveSessions(next)
    setSelectedIds([])
  }

  const toggleSelectAll = () => {
    if (!current) return
    const allIds = current.notes.map(n => n.id)
    if (allIds.length === 0) return
    const allSelected = allIds.every(id => selectedIds.includes(id))
    if (allSelected) setSelectedIds([])
    else setSelectedIds(allIds)
  }

  const updateNote = async (noteId: string, fields: Partial<TimestampNote>) => {
    if (!current) return
    const next = sessions.map((s) => {
      if (s.id !== current.id) return s
      return {
        ...s,
        notes: s.notes.map((n) => (n.id === noteId ? { ...n, ...fields, updatedAt: new Date().toISOString() } : n)).sort((a, b) => a.timestampMs - b.timestampMs),
        updatedAt: new Date().toISOString()
      }
    })
    await saveSessions(next)
  }

  const deleteNote = async (noteId: string) => {
    if (!current) return
    const next = sessions.map((s) => s.id === current.id ? { ...s, notes: s.notes.filter(x => x.id !== noteId), updatedAt: new Date().toISOString() } : s)
    await saveSessions(next)
  }

  const handleCtrlEnterNext = (currentNoteId: string) => {
    const nodes = Array.from(document.querySelectorAll('.note-card textarea'))
    const idx = nodes.findIndex(n => n.parentElement?.getAttribute('data-note-id') === currentNoteId)
    if (idx >= 0 && idx < nodes.length - 1) {
      (nodes[idx + 1] as HTMLElement).focus()
    } else {
      handleRecord()
    }
  }

  // Debounce persistence
  const persistTimerRef = useRef<number | null>(null)
  const pendingRef = useRef<Session[] | null>(null)
  const schedulePersist = (next: Session[]) => {
    pendingRef.current = next
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
    }
    persistTimerRef.current = window.setTimeout(async () => {
      if (pendingRef.current) {
        try {
          await storage.putSessions(pendingRef.current)
        } catch (err) {
          console.error('保存失败', err)
        }
        pendingRef.current = null
      }
      persistTimerRef.current = null
    }, 800)
  }

  const flushPersist = async () => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
      persistTimerRef.current = null
    }
    if (pendingRef.current) {
      await storage.putSessions(pendingRef.current)
      pendingRef.current = null
    }
  }

  useEffect(() => {
    // flush pending writes on unload
    const onBefore = async () => { await flushPersist() }
    window.addEventListener('beforeunload', onBefore)
    return () => {
      window.removeEventListener('beforeunload', onBefore)
      // flush on unmount
      flushPersist()
    }
  }, [])

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


  const fileInputRef = React.createRef<HTMLInputElement>()

  const handleExportJson = () => {
    if (!current) return alert('请先选择项目')
    importExport.downloadJson(current)
  }

  const handleImportJson = async (file?: File) => {
    try {
      const f = file ?? (fileInputRef.current?.files && fileInputRef.current.files[0])
      if (!f) return
      const imported = await importExport.readJsonFile(f)
      // sanitize imported session: ensure id and note ids, avoid collisions
      const newSession: Session = {
        id: imported.id || uuidv4(),
        title: imported.title || 'Imported',
        createdAt: imported.createdAt || new Date().toISOString(),
        updatedAt: imported.updatedAt || new Date().toISOString(),
        notes: []
      }
      const existingIds = new Set(sessions.map(s => s.id))
      if (existingIds.has(newSession.id)) newSession.id = uuidv4()
      const noteIds = new Set<string>()
      newSession.notes = (imported.notes || []).map((n: any) => {
        const nid = n.id && !noteIds.has(n.id) ? n.id : uuidv4()
        noteIds.add(nid)
        return {
          id: nid,
          timestampMs: Number(n.timestampMs || 0),
          note: String(n.note || ''),
          createdAt: n.createdAt || new Date().toISOString(),
          updatedAt: n.updatedAt || new Date().toISOString()
        }
      })
      // prepend imported session
      const next = [newSession, ...sessions]
      await saveSessions(next)
      setCurrentId(newSession.id)
    } catch (err: any) {
      alert('导入失败: ' + (err.message || String(err)))
    }
  }

  const handleExportMarkdown = async (media: string = '') => {
    if (!current) return alert('请先选择项目')
    const md = generateMarkdown(current, media)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${current.title || 'notes'}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleCopyMarkdown = async (media: string = '') => {
    if (!current) return alert('请先选择项目')
    const md = generateMarkdown(current, media)
    try {
      await navigator.clipboard.writeText(md)
      alert('已复制')
    } catch (err) {
      alert('复制失败，浏览器不支持或未授予权限')
    }
  }

  return (
    <div className="app-root">
      <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportJson(f) }} />
      <Sidebar sessions={sessions} currentId={currentId} onCreate={createSession} onSelect={setCurrentId} onDelete={deleteSession} />
      <main className="main-area">
        <div className="main-fixed">
          <div className="project-title">
            {!current ? (
              <div>请新建或选择项目</div>
            ) : (
              <div>
                <input className="project-title-input" value={titleInput} onChange={(e)=>setTitleInput(e.target.value)} onBlur={async ()=>{ if(titleInput!==current.title) await updateSessionTitle(titleInput) }} />
              </div>
            )}
          </div>

          <div style={{marginTop:8}}>
            <input placeholder="媒体地址（可留空）" value={mediaUrl} onChange={(e)=>setMediaUrl(e.target.value)} onBlur={async ()=>{ if(current && mediaUrl!==current.media) await updateSessionMedia(mediaUrl) }} style={{width:'100%', padding:8, borderRadius:8, border:'1px solid var(--border)'}} />
            <div style={{marginTop:8}}>
              <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>导入 JSON</button>
              <button className="btn btn-ghost btn-sm" onClick={handleExportJson}>导出 JSON</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { updateSessionMedia(mediaUrl); handleExportMarkdown(mediaUrl) }}>导出 Markdown</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { updateSessionMedia(mediaUrl); handleCopyMarkdown(mediaUrl) }}>复制 Markdown</button>
            </div>
          </div>
            <div className="timer-row">
            <div className="timer-display">{formatTime(timeMs)}</div>
            <div className="controls">
              {!running ? <button className="btn btn-primary" onClick={handleStart}>开始</button> : <button className="btn btn-secondary" onClick={pause}>暂停</button>}
              <button className="btn btn-secondary" onClick={handleRecord}>记录当前时间 (R)</button>
              <button className="btn btn-ghost" onClick={() => { reset() }}>归零</button>
              {!showSetTime ? (
                <button className="btn btn-ghost" onClick={() => { setShowSetTime(true); setSetTimeInput(formatTime(timeMs)) }}>设置时间</button>
              ) : (
                <span>
                  <input value={setTimeInput} onChange={(e)=>setSetTimeInput(e.target.value)} style={{width:120}} />
                  <button className="btn btn-primary" onClick={() => { const ms = parseTimeToMs(setTimeInput); if (ms==null) return alert('时间格式无效'); setTimeMs(ms); setShowSetTime(false); }}>保存</button>
                  <button className="btn btn-ghost" onClick={() => setShowSetTime(false)}>取消</button>
                </span>
              )}
            </div>
          </div>
          <div style={{marginTop:8}}>
            <input value={offsetInput} onChange={(e)=>setOffsetInput(e.target.value)} style={{width:120, padding:8, borderRadius:8, border:'1px solid var(--border)'}} />
            <button className="btn btn-ghost btn-sm" onClick={() => {
              const off = parseTimeToMs(offsetInput)
              if (off == null) return alert('时间格式无效')
              applyOffsetToSelected(off, true)
            }} style={{marginLeft:8}}>增加偏移</button>
            <button className="btn btn-ghost btn-sm" onClick={() => {
              const off = parseTimeToMs(offsetInput)
              if (off == null) return alert('时间格式无效')
              applyOffsetToSelected(off, false)
            }} style={{marginLeft:8}}>减少偏移</button>
            <button className="btn btn-ghost btn-sm" onClick={toggleSelectAll} style={{marginLeft:8}}>{current && current.notes.length>0 && current.notes.every(n=>selectedIds.includes(n.id)) ? '取消全选' : '全选'}</button>
          </div>
        </div>
          <div className="notes-area" ref={listRef}>
          <NoteList notes={current?.notes ?? []} onChange={(id, fields) => updateNote(id, fields)} onDelete={(id) => deleteNote(id)} onCtrlEnterNext={handleCtrlEnterNext} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
        </div>
      </main>
    </div>
  )
}

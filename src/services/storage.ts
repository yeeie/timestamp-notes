import { openDB, IDBPDatabase } from 'idb'

type TimestampNote = {
  id: string
  timestampMs: number
  note: string
  createdAt: string
  updatedAt: string
}

type Session = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  notes: TimestampNote[]
}

const DB_NAME = 'timestamp-notes-db'
const STORE = 'sessions'

export class Storage {
  db: IDBPDatabase | null = null

  async ready() {
    if (this.db) return this.db
    this.db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' })
        }
      }
    })
    return this.db
  }

  async getAllSessions(): Promise<Session[]> {
    const db = await this.ready()
    const all = await db.getAll(STORE)
    // ensure sort by updatedAt desc
    return all.sort((a: Session, b: Session) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  async putSessions(sessions: Session[]) {
    const db = await this.ready()
    const tx = db.transaction(STORE, 'readwrite')
    await Promise.all(sessions.map(s => tx.store.put(s)))
    await tx.done
  }
}

export type TimestampNote = {
  id: string
  timestampMs: number
  note: string
  createdAt: string
  updatedAt: string
}

export type Session = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  notes: TimestampNote[]
}
